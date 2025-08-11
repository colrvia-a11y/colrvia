import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import ErrorComponent from "@/app/error"

// Cast to expected props shape to satisfy TS in isolated test env
const TestError = ErrorComponent as unknown as ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => JSX.Element

describe("GlobalError", () => {
  it("renders and calls reset", () => {
    const reset = vi.fn()
    render(<TestError error={new Error("boom")} reset={reset} />)
    const btn = screen.getByRole("button", { name: /try again/i })
    fireEvent.click(btn)
    expect(reset).toHaveBeenCalled()
  })
})
