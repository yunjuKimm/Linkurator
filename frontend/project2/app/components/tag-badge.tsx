"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: string;
  onRemove?: (tag: string) => void;
  onClick?: (tag: string) => void;
  variant?: "default" | "secondary" | "outline" | "destructive";
  size?: "default" | "sm";
  className?: string;
  interactive?: boolean;
}

export default function TagBadge({
  tag,
  onRemove,
  onClick,
  variant = "default",
  size = "default",
  className,
  interactive = false,
}: TagBadgeProps) {
  // 태그 색상 결정 함수 (태그 이름에 따라 일관된 색상 생성)
  const getTagColor = (tag: string) => {
    // 간단한 해시 함수로 태그 이름을 숫자로 변환
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }

    // 색상 배열 (부드러운 파스텔 톤)
    const colors = [
      "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "bg-green-100 text-green-800 hover:bg-green-200",
      "bg-purple-100 text-purple-800 hover:bg-purple-200",
      "bg-pink-100 text-pink-800 hover:bg-pink-200",
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
      "bg-red-100 text-red-800 hover:bg-red-200",
      "bg-orange-100 text-orange-800 hover:bg-orange-200",
      "bg-teal-100 text-teal-800 hover:bg-teal-200",
      "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
    ];

    // 해시값을 색상 배열의 인덱스로 변환
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  const handleClick = () => {
    if (onClick) {
      onClick(tag);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(tag);
    }
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "px-2 py-1 flex items-center gap-1 transition-colors",
        size === "sm" ? "text-xs" : "text-sm",
        variant === "default" ? getTagColor(tag) : "",
        onClick ? "cursor-pointer" : "",
        interactive && "hover:shadow-sm",
        className
      )}
      onClick={onClick ? handleClick : undefined}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1 hover:text-destructive rounded-full flex items-center justify-center"
          aria-label={`태그 ${tag} 삭제`}
        >
          <X className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </button>
      )}
    </Badge>
  );
}
