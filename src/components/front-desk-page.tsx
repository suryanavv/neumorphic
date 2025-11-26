import data from "@/data.json"

const { frontDeskRequests } = data

export function FrontDeskPage() {

    return (
        <div className="space-y-6">
            {/* Front Desk Requests Table */}
            <div className="px-4 lg:px-6">
                <div className="neumorphic-inset rounded-lg p-4 border-0">
                    <div className="overflow-x-auto max-h-[78vh] overflow-y-auto">
                        <table className="w-full text-sm min-w-[800px]">
                            <thead className="sticky top-0 z-10 backdrop-blur-sm">
                                <tr className="border-b-2 border-muted/90 bg-muted/10">
                                    <th className="text-left font-medium py-3 px-2 min-w-[60px]">Clinic ID</th>
                                    <th className="text-left font-medium py-3 px-2 min-w-[120px]">Name</th>
                                    <th className="text-left font-medium py-3 px-2 min-w-[140px]">Phone Number</th>
                                    <th className="text-left font-medium py-3 px-2 min-w-[300px]">Notes</th>
                                    <th className="text-left font-medium py-3 px-2 min-w-[120px]">Created At</th>
                                    <th className="text-left font-medium py-3 px-2 min-w-[50px]">ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-muted/90">
                                {frontDeskRequests.map((request, index) => (
                                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-3 px-2 font-medium text-sm">{request.clinicId}</td>
                                        <td className="py-3 px-2 font-medium text-sm">{request.name}</td>
                                        <td className="py-3 px-2 text-muted-foreground text-sm">{request.phoneNumber}</td>
                                        <td className="py-3 px-2 text-muted-foreground text-sm max-w-xs">
                                            <div className="line-clamp-3" title={request.notes}>
                                                {request.notes}
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-muted-foreground text-sm">{request.createdAt}</td>
                                        <td className="py-3 px-2 font-medium text-sm text-primary">{request.id}</td>
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
