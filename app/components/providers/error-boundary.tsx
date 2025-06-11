'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Catch errors in any components below and log them
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI or the provided fallback
      return this.props.fallback || (
        <div className="error-boundary p-4 border border-red-500 rounded-md bg-red-50 text-red-800">
          <h2 className="text-lg font-semibold mb-2">Đã xảy ra lỗi</h2>
          <p className="mb-2">Lỗi này đã được ghi lại và không làm mới trang</p>
          <details className="text-sm">
            <summary className="cursor-pointer mb-1">Chi tiết lỗi</summary>
            <p className="mb-1 font-mono text-xs">{this.state.error?.toString()}</p>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40 bg-red-100 p-2 rounded text-xs">
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            Thử lại
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 