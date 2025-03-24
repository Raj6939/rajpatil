const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

const clients = {}; // Store clients by clientId

wss.on("connection", (ws) => {
    console.log("New client connected!");

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);
            console.log("Received:", data);

            // if (data.type === "Mobile Scanned"){
            //     const selectedData = data.data 
            //     const client =clients[data.clientID]
            //     client.send
            // }
            if (data.type === "register") {
                // Register the QR Display Webpage
                clients[data.clientId] = ws;
                console.log(`Client registered: ${data.clientId}`);

            } else if (data.type === "shareData") {
                if (!data.clientId) {
                    console.warn("Missing clientId in shareData request.");
                    return;
                }

                // Forward data to the registered client
                const targetClient = clients[data.clientId];

                if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                    targetClient.send(JSON.stringify({
                        type: "receivedData",
                        payload: data.payload
                    }));
                    console.log(`Data sent to ${data.clientId}:`, data.payload);
                } else {
                    console.warn(`Client ${data.clientId} not found or disconnected.`);
                }
            }
        } catch (error) {
            console.error("Error processing WebSocket message:", error);
        }
    });

    ws.on("close", () => {
        // Remove disconnected clients
        for (const clientId in clients) {
            if (clients[clientId] === ws) {
                console.log(`Client ${clientId} disconnected.`);
                delete clients[clientId];
                break;
            }
        }
    });
});

console.log("WebSocket server running on ws://localhost:8080");
