package com.team8.project2.domain.curation.repository;

import com.team8.project2.domain.curation.entity.Curation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CurationRepository extends JpaRepository<Curation, String> {
}
