package com.captain.helpdesk.services;

import com.captain.helpdesk.entity.Ticket;
import com.captain.helpdesk.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }
    public Ticket getTicketById(long id) {
        return ticketRepository.findById(id);
    }
    public Ticket createTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }
    public void deleteTicketById(long id) {
        ticketRepository.deleteById(id);
    }

    public Ticket changeTicketStatus(long id, Ticket updated) {
        Ticket existingTicket = ticketRepository.findById(id);
        existingTicket.setTitle(updated.getTitle());
        existingTicket.setDescription(updated.getDescription());
        return ticketRepository.save(updated);
    }
}
