const Ticket = require("../models/Ticket");
const User = require("../models/User");

exports.getAnalytics = async (req, res) => {
    try {
        // 1. Total Tickets
        const totalTickets = await Ticket.countDocuments();

        // 2. Status Distribution (Open, Closed, Resolved, etc.)
        const statusDistribution = await Ticket.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        // 3. Priority Distribution (Low, High, Urgent)
        const priorityDistribution = await Ticket.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);

        // 4. Tickets Created Over Time (Daily) - Last 7 Days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const ticketsOverTime = await Ticket.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // 5. Agent Performance (Tickets assigned per Agent)
        const agentPerformance = await Ticket.aggregate([
            { $match: { assignedTo: { $ne: null } } },
            { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "agent",
                },
            },
            { $unwind: "$agent" },
            { $project: { name: "$agent.name", count: 1 } },
        ]);

        // 6. Response Time (Average time from Creation to First Status Change/Resolution) - Rough Estimate here
        // For now, let's just count Resolved tickets
        const resolvedCount = await Ticket.countDocuments({ status: "RESOLVED" });
        const openCount = await Ticket.countDocuments({ status: "OPEN" });
        const closedCount = await Ticket.countDocuments({ status: "CLOSED" });

        res.json({
            success: true,
            data: {
                totalTickets,
                resolvedCount,
                openCount,
                closedCount,
                statusDistribution,
                priorityDistribution,
                ticketsOverTime,
                agentPerformance,
            },
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: "Server Error fetching analytics" });
    }
};
