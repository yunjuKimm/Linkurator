package com.team8.project2.domain.link.repository;

import com.team8.project2.domain.link.entity.Link;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LinkRepository extends JpaRepository<Link, Long> {

    Optional<Link> findByUrl(String url);
}

