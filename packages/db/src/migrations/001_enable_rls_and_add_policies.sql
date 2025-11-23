-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to see only their own data
CREATE POLICY user_select_policy ON users
  FOR SELECT
  USING (wallet_address = current_setting('app.current_user_wallet', true));

-- Allow users to update only their own data
CREATE POLICY user_update_policy ON users
  FOR UPDATE
  USING (wallet_address = current_setting('app.current_user_wallet', true));

-- Event Personas policies
CREATE POLICY event_persona_select_policy ON event_personas
  FOR SELECT
  USING (
    -- Users can see their own personas
    wallet_address = current_setting('app.current_user_wallet', true) OR
    -- Or public personas
    visibility = 'public' OR
    -- Or visible to event attendees if the user is an attendee of the event
    (visibility = 'attendees' AND EXISTS (
      SELECT 1 FROM event_attendees 
      WHERE event_id = event_personas.event_id 
      AND attendee_wallet = current_setting('app.current_user_wallet', true)
    )) OR
    -- Or visible to connections if the user is connected
    (visibility = 'connections' AND EXISTS (
      SELECT 1 FROM connections 
      WHERE ((from_wallet = wallet_address AND to_wallet = current_setting('app.current_user_wallet', true)) OR
             (to_wallet = wallet_address AND from_wallet = current_setting('app.current_user_wallet', true)))
      AND status = 'accepted'
    ))
  );

-- Connections policies
CREATE POLICY connection_select_policy ON connections
  FOR SELECT
  USING (
    from_wallet = current_setting('app.current_user_wallet', true) OR
    to_wallet = current_setting('app.current_user_wallet', true)
  );

CREATE POLICY connection_insert_policy ON connections
  FOR INSERT
  WITH CHECK (from_wallet = current_setting('app.current_user_wallet', true));

CREATE POLICY connection_update_policy ON connections
  FOR UPDATE
  USING (to_wallet = current_setting('app.current_user_wallet', true));

-- Messages policies
CREATE POLICY message_select_policy ON messages
  FOR SELECT
  USING (
    from_wallet = current_setting('app.current_user_wallet', true) OR
    to_wallet = current_setting('app.current_user_wallet', true)
  );

CREATE POLICY message_insert_policy ON messages
  FOR INSERT
  WITH CHECK (from_wallet = current_setting('app.current_user_wallet', true));

-- Notifications policies
CREATE POLICY notification_select_policy ON notifications
  FOR SELECT
  USING (user_wallet = current_setting('app.current_user_wallet', true));

CREATE POLICY notification_insert_policy ON notifications
  FOR INSERT
  WITH CHECK (user_wallet = current_setting('app.current_user_wallet', true));

-- Function to set the current user for RLS
CREATE OR REPLACE FUNCTION public.set_current_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM set_config('app.current_user_wallet', current_setting('request.jwt.claim.sub', true), true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to set the current user before each statement
CREATE TRIGGER set_user_wallet_trigger
  BEFORE SELECT OR INSERT OR UPDATE OR DELETE
  ON users
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.set_current_user_wallet();

-- Repeat for other tables
CREATE TRIGGER set_user_wallet_trigger
  BEFORE SELECT OR INSERT OR UPDATE OR DELETE
  ON event_personas
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.set_current_user_wallet();

CREATE TRIGGER set_user_wallet_trigger
  BEFORE SELECT OR INSERT OR UPDATE OR DELETE
  ON connections
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.set_current_user_wallet();

CREATE TRIGGER set_user_wallet_trigger
  BEFORE SELECT OR INSERT OR UPDATE OR DELETE
  ON messages
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.set_current_user_wallet();

CREATE TRIGGER set_user_wallet_trigger
  BEFORE SELECT OR INSERT OR UPDATE OR DELETE
  ON notifications
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.set_current_user_wallet();
