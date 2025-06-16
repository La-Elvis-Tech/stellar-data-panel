
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const orders = [
  { id: "#12345", customer: "John Doe", amount: "$99.99", status: "Completed", date: "2024-01-15" },
  { id: "#12346", customer: "Jane Smith", amount: "$149.99", status: "Processing", date: "2024-01-14" },
  { id: "#12347", customer: "Bob Wilson", amount: "$79.99", status: "Pending", date: "2024-01-13" },
  { id: "#12348", customer: "Alice Brown", amount: "$199.99", status: "Completed", date: "2024-01-12" },
];

export default function Orders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">Track and manage customer orders.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{order.amount}</p>
                  <p className="text-sm text-gray-600">{order.date}</p>
                </div>
                <Badge 
                  variant={
                    order.status === "Completed" ? "default" :
                    order.status === "Processing" ? "secondary" : "outline"
                  }
                >
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
