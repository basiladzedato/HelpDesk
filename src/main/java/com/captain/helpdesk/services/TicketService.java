package com.captain.helpdesk.services;

import com.captain.helpdesk.dto.TicketResponseDTO;
import com.captain.helpdesk.entity.Ticket;
import com.captain.helpdesk.entity.User;
import com.captain.helpdesk.repository.TicketRepository;
import com.captain.helpdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll().stream().map(this::toDTO).toList();

    }

    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(("Ticket Not Found")));
        return toDTO(ticket);
    }

    public TicketResponseDTO createTicket(Ticket ticket, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException(("User not Found")));
        ticket.setUser(user);

        Ticket savedTicket = ticketRepository.save(ticket);
        return toDTO(savedTicket);
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

    private TicketResponseDTO toDTO(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());

        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setCreatedAt(ticket.getCreatedAt());

        dto.setUserId(ticket.getUser().getId());
        dto.setUsername(ticket.getUser().getUsername());

        return dto;
    }
}
