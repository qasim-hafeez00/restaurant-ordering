export default function Loading() {
  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg">Loading menu...</p>
      </div>
    </div>
  )
}
