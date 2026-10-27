package com.captain.helpdesk.repository;

import com.captain.helpdesk.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Ticket findById(long id);
    List<Ticket> findByUserUsername(String username);
}
