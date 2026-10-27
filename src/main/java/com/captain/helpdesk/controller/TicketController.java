package com.captain.helpdesk.controller;

import com.captain.helpdesk.dto.TicketResponseDTO;
import com.captain.helpdesk.entity.Ticket;
import com.captain.helpdesk.entity.TicketStatus;
import com.captain.helpdesk.repository.TicketRepository;
import com.captain.helpdesk.services.TicketService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
    public List<TicketResponseDTO> getTickets(Authentication authentication) {

        boolean isSupport = authentication
                .getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_SUPPORT"));

        if (isSupport) {
            return ticketService.getAllTickets();
        }
        return ticketService.getTicketsForUser(authentication.getName());
    }

    @GetMapping("/tickets/{id}")
    public TicketResponseDTO getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id);
    }

    @PostMapping("/tickets")
    public TicketResponseDTO createTicket(@Valid @RequestBody Ticket ticket, Authentication authentication) {
        return ticketService.createTicket(ticket, authentication.getName());
    }

    @PutMapping("/tickets/{id}")
    public Ticket updateTicket(@PathVariable long id, @RequestBody Ticket ticket) {
        return ticketService.changeTicketStatus(id, ticket);
    }

    @PreAuthorize("hasRole('SUPPORT')")
    @DeleteMapping("/tickets/{id}")
    public void deleteTicket(@PathVariable long id) {
        ticketService.deleteTicketById(id);
    }

    @PutMapping("/tickets/{id}/status")
    @PreAuthorize("hasRole('SUPPORT)")
    public TicketResponseDTO changeStatus(@PathVariable Long id, @RequestParam TicketStatus status) {
        return ticketService.changeStatus(id, status);
    }

}
