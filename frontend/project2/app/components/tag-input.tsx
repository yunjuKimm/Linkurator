"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TagBadge from "./tag-badge";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  suggestions?: string[];
}

export default function TagInput({
  tags,
  onChange,
  placeholder = "태그 입력 후 엔터",
  maxTags = 10,
  className = "",
  suggestions = [],
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 입력값에 따라 제안 필터링
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredSuggestions([]);
      return;
    }

    const filtered = suggestions.filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(suggestion)
    );
    setFilteredSuggestions(filtered.slice(0, 5)); // 최대 5개까지만 표시
  }, [inputValue, suggestions, tags]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      const newTags = [...tags, trimmedTag];
      onChange(newTags);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && inputValue.trim() !== "") {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <TagBadge
            key={index}
            tag={tag}
            onRemove={removeTag}
            variant="default"
          />
        ))}
      </div>
      <div className="flex gap-2 relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={
            tags.length >= maxTags
              ? `최대 ${maxTags}개까지 추가 가능합니다`
              : placeholder
          }
          className="flex-1"
          disabled={tags.length >= maxTags}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => addTag(inputValue)}
          disabled={
            inputValue.trim() === "" ||
            tags.includes(inputValue.trim()) ||
            tags.length >= maxTags
          }
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">태그 추가</span>
        </Button>

        {/* 태그 제안 드롭다운 */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-md z-10 max-h-[200px] overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {tags.length}/{maxTags} 태그 추가 가능
      </p>
    </div>
  );
}
