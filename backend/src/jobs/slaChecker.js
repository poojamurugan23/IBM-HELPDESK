const cron = require("node-cron");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

// Run every hour to check SLA breaches
cron.schedule("0 * * * *", async () => {
    console.log("⏰ Running SLA Check Job...");

    try {
        const now = new Date();

        // Find tickets that are overdue and NOT yet marked as breached
        const breachedTickets = await Ticket.find({
            slaDeadline: { $lt: now },
            isSlaBreached: false,
            status: { $nin: ["RESOLVED", "CLOSED"] }
        }).populate("assignedTo");

        if (breachedTickets.length > 0) {
            console.log(`⚠️ Found ${breachedTickets.length} breached tickets. Escalating...`);

            // Get managers/admins to notify
            const managers = await User.find({ role: { $in: ["ADMIN", "MANAGER", "SUPER_ADMIN"] } });
            const managerEmails = managers.map(u => u.email);

            for (const ticket of breachedTickets) {
                ticket.isSlaBreached = true;
                await ticket.save();

                // Notify Admins/Managers
                managerEmails.forEach(email => {
                    sendEmail(
                        email,
                        `⚠️ SLA BREACH ALERT: Ticket #${ticket._id}`,
                        `Ticket "${ticket.subject}" (Priority: ${ticket.priority}) has breached its SLA deadline.\nassigned to: ${ticket.assignedTo?.name || 'Unassigned'}`
                    );
                });

                // Notify Assigned Agent if any
                if (ticket.assignedTo) {
                    sendEmail(
                        ticket.assignedTo.email,
                        `⚠️ URGENT: SLA Breached for your ticket #${ticket._id}`,
                        `Your ticket "${ticket.subject}" is OVERDUE. Please resolve immediately.`
                    );
                }
            }
        } else {
            console.log("✅ No new SLA breaches found.");
        }

    } catch (error) {
        console.error("Error in SLA cron job:", error);
    }
});
