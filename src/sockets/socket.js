export function socketMain(client) {
    // When a user logs in, they join their personal notification room
    client.on("login", function (data) {
        if (data.userId) {
            client.join(`user_${data.userId}`);
            console.log(`[SOCKET] User ${data.userId} joined room user_${data.userId}`);
        }
        client.broadcast.emit(`logout/${data.userId}`);
    });

    // Allow manually joining the notification room (for page refreshes after login)
    client.on("join", function (data) {
        if (data.userId) {
            client.join(`user_${data.userId}`);
            console.log(`[SOCKET] User ${data.userId} joined notification room.`);
        }
    });

    client.on("newPatient", function (data) {
        client.broadcast.emit(`newPatient/${data.doctorId}`);
    });
}