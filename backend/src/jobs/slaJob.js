const cron = require("node-cron");
const Ticket = require("../models/Ticket");
const sendEmail = require("../utils/sendEmail");

const checkSla = async () => {
    try {
        const expiredTickets = await Ticket.find({
            status: { $nin: ["RESOLVED", "CLOSED"] },
            slaDeadline: { $lt: new Date() },
            isSlaBreached: false,
        }).populate("assignedTo createdBy");

        for (const ticket of expiredTickets) {
            ticket.isSlaBreached = true;
            await ticket.save();

            // Notify Assigned Agent
            if (ticket.assignedTo) {
                await sendEmail(
                    ticket.assignedTo.email,
                    `SLA Breached: Ticket #${ticket._id}`,
                    `<p>Ticket <strong>${ticket.subject}</strong> has breached its SLA deadline.</p><p>Please prioritize this immediately.</p>`
                );
            } else {
                // Escalate to admin or general queue notification
                console.log(`Ticket ${ticket._id} breached SLA and is unassigned!`);
            }
        }
    } catch (error) {
        console.error("Error running SLA check:", error);
    }
};

// Run cron job every 5 minutes
const initSlaJob = () => {
    cron.schedule("*/5 * * * *", checkSla);
    console.log("SLA Checker Job Scheduled");
};

module.exports = initSlaJob;
