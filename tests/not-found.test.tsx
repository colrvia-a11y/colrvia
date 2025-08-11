import React from "react"
import { render, screen } from "@testing-library/react"
import NotFound from "@/app/not-found"

describe("NotFound", () => {
  it("renders heading and links", () => {
    render(<NotFound />)
    expect(screen.getByRole("heading", { name: /couldn’t find/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /go home/i })).toHaveAttribute("href", "/")
    expect(screen.getByRole("link", { name: /start a color story/i })).toHaveAttribute("href", "/start")
  })
})
