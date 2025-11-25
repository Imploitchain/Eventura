// Lazy loading components and dynamic imports

// Lazy loading wrapper component
export function lazyLoad(importFn: () => Promise<any>, fallback?: React.ComponentType) {
  const LazyComponent = React.lazy(importFn);
  
  return (props: any) => (
    <React.Suspense fallback={fallback ? <fallback /> : <div className="animate-pulse bg-gray-200 h-32 rounded" />}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
}

// Dynamic imports for heavy components
export const LazyQRScanner = lazyLoad(
  () => import('./QRScanner'),
  () => <div className="bg-gray-100 p-4 rounded text-center">Loading QR Scanner...</div>
);

export const LazyRichTextEditor = lazyLoad(
  () => import('./RichTextEditor'),
  () => <div className="bg-gray-100 p-4 rounded text-center">Loading Editor...</div>
);

export const LazyCharts = lazyLoad(
  () => import('./ChartComponents'),
  () => <div className="bg-gray-100 p-4 rounded text-center">Loading Charts...</div>
);

export const LazyVideoPlayer = lazyLoad(
  () => import('./VideoPlayer'),
  () => <div className="bg-gray-100 p-4 rounded text-center">Loading Video...</div>
);

export const LazyPDFExport = lazyLoad(
  () => import('./PDFExport'),
  () => <div className="bg-gray-100 p-4 rounded text-center">Loading PDF Export...</div>
);

// Optimized skeleton components
export const ImageSkeleton = () => (
  <div className="animate-pulse bg-gray-200 h-48 w-full rounded-lg" />
);

export const CardSkeleton = () => (
  <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-600 rounded w-3/4"></div>
      <div className="h-4 bg-gray-600 rounded w-1/2"></div>
    </div>
    <div className="animate-pulse">
      <div className="h-32 bg-gray-700 rounded"></div>
    </div>
    <div className="animate-pulse space-y-2">
      <div className="h-3 bg-gray-600 rounded"></div>
      <div className="h-3 bg-gray-600 rounded w-5/6"></div>
    </div>
  </div>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
    ))}
  </div>
);