import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { deployContracts, createEvent, mintTicket, ZERO_ADDRESS } from './helpers';

describe('EventTicketing', function () {
  describe('Deployment', function () {
    it('should deploy and initialize correctly', async function () {
      const { eventTicketing, eventFactory, organizer } = await deployContracts();
      
      // Check basic info
      expect(await eventTicketing.name()).to.equal('Eventura Tickets');
      expect(await eventTicketing.symbol()).to.equal('TICKET');
      
      // Check roles
      expect(await eventTicketing.hasRole(await eventTicketing.ORGANIZER_ROLE(), organizer.address)).to.be.true;
      expect(await eventTicketing.hasRole(await eventTicketing.DEFAULT_ADMIN_ROLE(), organizer.address)).to.be.true;
    });
  });

  describe('Event Management', function () {
    it('should create a new event through factory', async function () {
      const { eventFactory, eventTicketing, organizer } = await deployContracts();
      
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 3600; // 1 hour from now
      const endTime = startTime + 7200; // 2 hour duration
      const ticketPrice = ethers.parseEther('0.1');
      const maxTickets = 100;
      
      // Create event through factory
      const tx = await eventFactory.connect(organizer).createEvent(
        'ipfs://event-metadata',
        startTime,
        endTime,
        ticketPrice,
        maxTickets
      );
      
      const receipt = await tx.wait();
      const eventCreated = receipt.logs.find(
        (log: any) => log.fragment?.name === 'EventCreated'
      );
      
      expect(eventCreated).to.exist;
      
      // Verify event data in EventTicketing contract
      const eventId = eventCreated.args[0];
      const event = await eventTicketing.events(eventId);
      
      expect(event.organizer).to.equal(organizer.address);
      expect(event.metadataURI).to.equal('ipfs://event-metadata');
      expect(event.startTime).to.equal(startTime);
      expect(event.endTime).to.equal(endTime);
      expect(event.ticketPrice).to.equal(ticketPrice);
      expect(event.maxTickets).to.equal(maxTickets);
      expect(event.ticketsSold).to.equal(0);
      expect(event.active).to.be.true;
      expect(event.cancelled).to.be.false;
    });

    it('should allow organizer to update event details', async function () {
      const { eventFactory, eventTicketing, organizer } = await deployContracts();
      
      // Create event first
      const { eventId } = await createEvent(eventFactory, organizer);
      
      // Update event
      const newMetadataURI = 'ipfs://updated-metadata';
      const newStartTime = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
      const newEndTime = newStartTime + 3600; // 1 hour duration
      
      await eventFactory.connect(organizer).updateEvent(
        eventId,
        newMetadataURI,
        newStartTime,
        newEndTime
      );
      
      // Verify update in EventTicketing
      const event = await eventTicketing.events(eventId);
      expect(event.metadataURI).to.equal(newMetadataURI);
      expect(event.startTime).to.equal(newStartTime);
      expect(event.endTime).to.equal(newEndTime);
    });
  });

  describe('Ticket Minting', function () {
    it('should allow users to mint tickets', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();
      
      // Create event
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      
      // Mint ticket
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Verify ticket ownership
      expect(await eventTicketing.ownerOf(tokenId)).to.equal(attendee1.address);
      
      // Verify event ticket count
      const event = await eventTicketing.events(eventId);
      expect(event.ticketsSold).to.equal(1);
      
      // Verify ticket data
      const ticket = await eventTicketing.tickets(tokenId);
      expect(ticket.eventId).to.equal(eventId);
      expect(ticket.owner).to.equal(attendee1.address);
      expect(ticket.used).to.be.false;
    });

    it('should not allow minting with incorrect payment', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();
      
      // Create event
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      
      // Try to mint with incorrect payment
      await expect(
        eventTicketing.connect(attendee1).mintTicket(eventId, { 
          value: ticketPrice / BigInt(2) // Half the required amount
        })
      ).to.be.revertedWith('Incorrect payment amount');
    });

    it('should not allow minting if event is sold out', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event with only 1 ticket
      const { eventId, ticketPrice } = await createEvent(
        eventFactory, 
        organizer,
        3600, // start in 1 hour
        7200, // 2 hour duration
        ethers.parseEther('0.1'),
        1 // max 1 ticket
      );
      
      // Mint one ticket (should succeed)
      await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Try to mint another ticket (should fail)
      await expect(
        eventTicketing.connect(attendee2).mintTicket(eventId, { value: ticketPrice })
      ).to.be.revertedWith('Event sold out');
    });
  });

  describe('Ticket Transfers', function () {
    it('should allow ticket transfers between users', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Transfer ticket
      await eventTicketing.connect(attendee1)['safeTransferFrom(address,address,uint256)'](
        attendee1.address,
        attendee2.address,
        tokenId
      );
      
      // Verify new owner
      expect(await eventTicketing.ownerOf(tokenId)).to.equal(attendee2.address);
      
      // Verify ticket data
      const ticket = await eventTicketing.tickets(tokenId);
      expect(ticket.owner).to.equal(attendee2.address);
    });

    it('should prevent transfers after event starts', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event that starts immediately
      const now = Math.floor(Date.now() / 1000);
      const { eventId, ticketPrice } = await createEvent(
        eventFactory, 
        organizer,
        0, // starts immediately
        3600 // 1 hour duration
      );
      
      // Mint ticket
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Try to transfer after event starts
      await expect(
        eventTicketing.connect(attendee1)['safeTransferFrom(address,address,uint256)'](
          attendee1.address,
          attendee2.address,
          tokenId
        )
      ).to.be.revertedWith('Transfers not allowed after event starts');
    });
  });

  describe('Ticket Usage', function () {
    it('should allow organizer to mark ticket as used', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Mark as used
      await eventTicketing.connect(organizer).markTicketUsed(tokenId, true);
      
      // Verify
      const ticket = await eventTicketing.tickets(tokenId);
      expect(ticket.used).to.be.true;
      
      // Emit event
      const filter = eventTicketing.filters.TicketUsed(tokenId, true);
      const events = await eventTicketing.queryFilter(filter);
      expect(events.length).to.equal(1);
    });

    it('should prevent non-organizers from marking tickets as used', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1, attendee2 } = await deployContracts();
      
      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Try to mark as used with non-organizer account
      await expect(
        eventTicketing.connect(attendee2).markTicketUsed(tokenId, true)
      ).to.be.reverted;
    });
  });

  describe('Refunds', function () {
    it('should allow refunds before event starts', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();
      
      // Create event in the future
      const { eventId, ticketPrice } = await createEvent(
        eventFactory,
        organizer,
        3600, // starts in 1 hour
        7200  // 2 hour duration
      );
      
      // Mint ticket
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Get initial balance
      const initialBalance = await ethers.provider.getBalance(attendee1.address);
      
      // Request refund
      const tx = await eventTicketing.connect(attendee1).requestRefund(tokenId);
      const receipt = await tx.wait();
      
      // Calculate gas cost
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      // Check final balance
      const finalBalance = await ethers.provider.getBalance(attendee1.address);
      const expectedBalance = initialBalance + ticketPrice - gasUsed;
      
      // Allow for small difference due to gas estimation
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther('0.001'));
      
      // Verify ticket is burned
      await expect(eventTicketing.ownerOf(tokenId)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('should not allow refunds after event starts', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();
      
      // Create event that starts immediately
      const { eventId, ticketPrice } = await createEvent(
        eventFactory,
        organizer,
        0, // starts immediately
        3600 // 1 hour duration
      );
      
      // Mint ticket
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      
      // Try to request refund
      await expect(
        eventTicketing.connect(attendee1).requestRefund(tokenId)
      ).to.be.revertedWith('Refund period has ended');
    });
  });

  describe('Waitlist Management', function () {
    it('should allow users to join waitlist when event is sold out', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1, attendee2 } = await deployContracts();

      // Create event with only 1 ticket
      const { eventId, ticketPrice } = await createEvent(
        eventFactory,
        organizer,
        3600,
        7200,
        ethers.parseEther('0.1'),
        1
      );

      // Mint the only ticket
      await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);

      // Join waitlist
      await eventTicketing.connect(attendee2).joinWaitlist(eventId);

      // Verify waitlist count
      expect(await eventTicketing.getWaitlistCount(eventId)).to.equal(1);

      // Verify waitlist entry
      const waitlist = await eventTicketing.getWaitlist(eventId);
      expect(waitlist.length).to.equal(1);
      expect(waitlist[0].user).to.equal(attendee2.address);
    });

    it('should allow users to leave waitlist', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1, attendee2 } = await deployContracts();

      // Create sold out event
      const { eventId, ticketPrice } = await createEvent(
        eventFactory,
        organizer,
        3600,
        7200,
        ethers.parseEther('0.1'),
        1
      );
      await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);

      // Join and then leave waitlist
      await eventTicketing.connect(attendee2).joinWaitlist(eventId);
      await eventTicketing.connect(attendee2).leaveWaitlist(eventId);

      // Verify waitlist is empty
      expect(await eventTicketing.getWaitlistCount(eventId)).to.equal(0);
    });

    it('should not allow joining waitlist for non-sold-out events', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();

      // Create event with available tickets
      const { eventId } = await createEvent(
        eventFactory,
        organizer,
        3600,
        7200,
        ethers.parseEther('0.1'),
        100
      );

      // Try to join waitlist
      await expect(
        eventTicketing.connect(attendee1).joinWaitlist(eventId)
      ).to.be.revertedWith('Event is not sold out');
    });
  });

  describe('Event Cancellation', function () {
    it('should allow organizer to cancel event', async function () {
      const { eventFactory, eventTicketing, organizer } = await deployContracts();

      // Create event
      const { eventId } = await createEvent(eventFactory, organizer);

      // Cancel event
      await eventTicketing.connect(organizer).cancelEvent(eventId);

      // Verify cancellation
      const event = await eventTicketing.events(eventId);
      expect(event.cancelled).to.be.true;
    });

    it('should not allow non-organizers to cancel events', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();

      // Create event
      const { eventId } = await createEvent(eventFactory, organizer);

      // Try to cancel with non-organizer
      await expect(
        eventTicketing.connect(attendee1).cancelEvent(eventId)
      ).to.be.reverted;
    });

    it('should allow refunds for cancelled events', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();

      // Create event and mint ticket
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);

      // Cancel event
      await eventTicketing.connect(organizer).cancelEvent(eventId);

      // Get initial balance
      const initialBalance = await ethers.provider.getBalance(attendee1.address);

      // Request refund
      const tx = await eventTicketing.connect(attendee1).refundTicket(tokenId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      // Verify refund
      const finalBalance = await ethers.provider.getBalance(attendee1.address);
      const expectedBalance = initialBalance + ticketPrice - gasUsed;
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther('0.001'));
    });
  });

  describe('Access Control', function () {
    it('should allow admin to grant organizer role', async function () {
      const { eventTicketing, organizer, attendee1 } = await deployContracts();

      // Grant organizer role
      await eventTicketing.connect(organizer).grantOrganizerRole(attendee1.address);

      // Verify role
      expect(await eventTicketing.hasRole(
        await eventTicketing.ORGANIZER_ROLE(),
        attendee1.address
      )).to.be.true;
    });

    it('should allow admin to revoke organizer role', async function () {
      const { eventTicketing, organizer, attendee1 } = await deployContracts();

      // Grant then revoke
      await eventTicketing.connect(organizer).grantOrganizerRole(attendee1.address);
      await eventTicketing.connect(organizer).revokeOrganizerRole(attendee1.address);

      // Verify role revoked
      expect(await eventTicketing.hasRole(
        await eventTicketing.ORGANIZER_ROLE(),
        attendee1.address
      )).to.be.false;
    });

    it('should not allow non-admins to grant roles', async function () {
      const { eventTicketing, attendee1, attendee2 } = await deployContracts();

      // Try to grant role without admin permission
      await expect(
        eventTicketing.connect(attendee1).grantOrganizerRole(attendee2.address)
      ).to.be.reverted;
    });
  });

  describe('View Functions', function () {
    it('should correctly report if event is sold out', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();

      // Create event with 1 ticket
      const { eventId, ticketPrice } = await createEvent(
        eventFactory,
        organizer,
        3600,
        7200,
        ethers.parseEther('0.1'),
        1
      );

      // Should not be sold out initially
      expect(await eventTicketing.isSoldOut(eventId)).to.be.false;

      // Mint ticket
      await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);

      // Should be sold out now
      expect(await eventTicketing.isSoldOut(eventId)).to.be.true;
    });

    it('should return available tickets count', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();

      const maxTickets = 10;
      const { eventId, ticketPrice } = await createEvent(
        eventFactory,
        organizer,
        3600,
        7200,
        ethers.parseEther('0.1'),
        maxTickets
      );

      // Initially all available
      expect(await eventTicketing.getAvailableTickets(eventId)).to.equal(maxTickets);

      // Mint 3 tickets
      await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);

      // Should have 7 available
      expect(await eventTicketing.getAvailableTickets(eventId)).to.equal(maxTickets - 3);
    });

    it('should return user tickets', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();

      // Create event
      const { eventId, ticketPrice } = await createEvent(eventFactory, organizer);

      // Mint multiple tickets
      const tokenId1 = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      const tokenId2 = await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);

      // Get user tickets
      const userTickets = await eventTicketing.getUserTickets(attendee1.address);
      expect(userTickets.length).to.equal(2);
      expect(userTickets).to.include(tokenId1);
      expect(userTickets).to.include(tokenId2);
    });

    it('should return organizer events', async function () {
      const { eventFactory, eventTicketing, organizer } = await deployContracts();

      // Create multiple events
      const { eventId: eventId1 } = await createEvent(eventFactory, organizer);
      const { eventId: eventId2 } = await createEvent(eventFactory, organizer);

      // Get organizer events
      const organizerEvents = await eventTicketing.getOrganizerEvents(organizer.address);
      expect(organizerEvents.length).to.equal(2);
      expect(organizerEvents).to.include(eventId1);
      expect(organizerEvents).to.include(eventId2);
    });
  });

  describe('Edge Cases', function () {
    it('should handle zero ticket price events', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();

      // Create free event
      const { eventId } = await createEvent(
        eventFactory,
        organizer,
        3600,
        7200,
        0, // Free
        100
      );

      // Mint free ticket
      const tokenId = await mintTicket(eventTicketing, eventId, attendee1, 0);

      // Verify ownership
      expect(await eventTicketing.ownerOf(tokenId)).to.equal(attendee1.address);
    });

    it('should prevent creating events in the past', async function () {
      const { eventFactory, organizer } = await deployContracts();

      const now = Math.floor(Date.now() / 1000);
      const pastTime = now - 3600; // 1 hour ago

      // Try to create event in the past
      await expect(
        eventFactory.connect(organizer).createEvent(
          'ipfs://event',
          pastTime,
          pastTime + 3600,
          ethers.parseEther('0.1'),
          100
        )
      ).to.be.reverted;
    });

    it('should handle maximum ticket limit', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();

      const maxTickets = 5;
      const { eventId, ticketPrice } = await createEvent(
        eventFactory,
        organizer,
        3600,
        7200,
        ethers.parseEther('0.1'),
        maxTickets
      );

      // Mint max tickets
      for (let i = 0; i < maxTickets; i++) {
        await mintTicket(eventTicketing, eventId, attendee1, ticketPrice);
      }

      // Verify sold out
      expect(await eventTicketing.isSoldOut(eventId)).to.be.true;

      // Try to mint one more
      await expect(
        eventTicketing.connect(attendee1).mintTicket(eventId, { value: ticketPrice })
      ).to.be.revertedWith('Event sold out');
    });

    it('should prevent minting after event ends', async function () {
      const { eventFactory, eventTicketing, organizer, attendee1 } = await deployContracts();

      const now = Math.floor(Date.now() / 1000);
      const { eventId, ticketPrice } = await createEvent(
        eventFactory,
        organizer,
        0, // starts immediately
        1 // ends in 1 second
      );

      // Wait for event to end
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Try to mint ticket
      await expect(
        eventTicketing.connect(attendee1).mintTicket(eventId, { value: ticketPrice })
      ).to.be.revertedWith('Event has ended');
    });
  });
});
