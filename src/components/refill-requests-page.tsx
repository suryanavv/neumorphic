import data from "@/data.json"

const { refillRequests } = data

export function RefillRequestsPage() {

  return (
    <div className="space-y-6">
      {/* Refill Requests Table */}
      <div className="px-4 lg:px-6">
        <div className="neumorphic-inset rounded-lg p-4 border-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="sticky top-0 z-10 backdrop-blur-sm">
                <tr className="border-b-2 border-muted/90 bg-muted/10">
                  <th className="text-left font-medium py-3 px-2 min-w-[80px] whitespace-nowrap">Patient ID</th>
                  <th className="text-left font-medium py-3 px-2 min-w-[120px]">Patient Name</th>
                  <th className="text-left font-medium py-3 px-2 min-w-[140px]">Patient Phone</th>
                  <th className="text-left font-medium py-3 px-2 min-w-[120px]">Caller Name</th>
                  <th className="text-left font-medium py-3 px-2 min-w-[100px]">Relationship</th>
                  <th className="text-left font-medium py-3 px-2 min-w-[200px]">Details</th>
                  <th className="text-left font-medium py-3 px-2 min-w-[150px]">Pharmacy Name</th>
                  <th className="text-left font-medium py-3 px-2 min-w-[180px]">Pharmacy Location</th>
                  <th className="text-left font-medium py-3 px-2 min-w-[100px]">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-muted/90">
                {refillRequests.map((request, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 font-medium text-sm text-primary">#{request.patientId}</td>
                    <td className="py-3 px-2 font-medium text-sm">{request.patientName}</td>
                    <td className="py-3 px-2 text-muted-foreground text-sm">{request.patientPhone}</td>
                    <td className="py-3 px-2 text-muted-foreground text-sm">{request.callerName}</td>
                    <td className="py-3 px-2 text-muted-foreground text-sm">{request.relationship}</td>
                    <td className="py-3 px-2 text-muted-foreground text-sm max-w-xs">
                      <div className="line-clamp-2" title={request.details}>
                        {request.details}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground text-sm">{request.pharmacyName}</td>
                    <td className="py-3 px-2 text-muted-foreground text-sm max-w-xs">
                      <div className="line-clamp-2" title={request.pharmacyLocation}>
                        {request.pharmacyLocation}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground text-sm">{request.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
