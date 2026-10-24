package com.captain.helpdesk.controller;

import com.captain.helpdesk.entity.Ticket;
import com.captain.helpdesk.repository.TicketRepository;
import com.captain.helpdesk.services.TicketService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
@RequestMapping("/api")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/tickets")
    public List<Ticket> getTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/tickets/{id}")
    public Ticket getTicketById(@PathVariable long id) {
        return ticketService.getTicketById(id);
    }

    @PostMapping("/tickets")
    public Ticket createTicket(@RequestBody Ticket ticket) {
        return ticketService.createTicket(ticket);
    }

    @PutMapping("/tickets/{id}")
    public Ticket updateTicket(@PathVariable long id, @RequestBody Ticket ticket) {
        return ticketService.changeTicketStatus(id, ticket);
    }

    @DeleteMapping("/tickets/{id}")
    public void deleteTicket(@PathVariable long id) {
        ticketService.deleteTicketById(id);
    }

}
