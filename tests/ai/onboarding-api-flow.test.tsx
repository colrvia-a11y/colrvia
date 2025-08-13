import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import InterviewIntro from "@/app/(shell)/start/interview-intro/page";
import ProcessingPage from "@/app/(shell)/start/processing/page";
import InterviewPage from "@/app/(shell)/start/interview/page";
import { moss } from "@/lib/ai/phrasing";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() })
}));

// Mock hook to supply deterministic question
vi.mock("@/lib/hooks/useOnboardingFlow", () => ({
  default: () => ({
    state: { answers: {} },
    currentQ: { key: "space", prompt: "Which space are we working on?", options: ["Living room"] },
    sendAnswer: vi.fn(),
    done: false
  })
}));

describe("onboarding flow pages", () => {
  it("renders interview intro", () => {
    render(<InterviewIntro />);
    expect(screen.getByText(/Designer interview/i)).toBeTruthy();
  });

  it("shows processing message", () => {
    render(<ProcessingPage />);
    expect(screen.getByText(moss.working())).toBeTruthy();
  });

  it("shows moss greeting and progress label", () => {
    render(<InterviewPage />);
    expect(screen.getByText(moss.greet())).toBeTruthy();
    expect(screen.getByText(/Room 1\/4/)).toBeTruthy();
  });
});
