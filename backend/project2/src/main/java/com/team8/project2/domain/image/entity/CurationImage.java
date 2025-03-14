package com.team8.project2.domain.image.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.team8.project2.domain.curation.curation.entity.Curation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Entity
@Table(name = "curationImages")
public class CurationImage {
	@Id
	@Column(name = "curationImageId")
	private Long id;

	private String imageName;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "curationId")
	private Curation curation;

	@CreatedDate
	@Setter(AccessLevel.PRIVATE)
	@Column(name = "uploadedAt", nullable = false)
	private LocalDateTime uploadedAt;
}
