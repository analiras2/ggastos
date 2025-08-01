import { SnackBar } from '@components/ui'
import { act, render } from '@testing-library/react-native'
import { Animated, StyleSheet } from 'react-native'
import React from 'react'

jest.useFakeTimers()

describe('SnackBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render correctly with default props', () => {
      const { getByText } = render(
        <SnackBar
          visible={true}
          onDismiss={() => jest.fn()}
          message="Test message"
        />
      )

      expect(getByText('Test message')).toBeTruthy()
    })

    it('should not be visible when visible prop is false', () => {
      const { queryByText } = render(
        <SnackBar
          visible={false}
          onDismiss={() => jest.fn()}
          message="Test message"
        />
      )

      expect(queryByText('Test message')).toBeNull()
    })

    it('should render with different types', () => {
      const types = ['success', 'error', 'info', 'warning'] as const

      types.forEach((type) => {
        const { getByTestId } = render(
          <SnackBar
            visible={true}
            message="Test message"
            type={type}
            onDismiss={() => jest.fn()}
            testID={`snackbar-${type}`}
          />
        )

        expect(getByTestId(`snackbar-${type}`)).toBeTruthy()
      })
    })
  })

  describe('Behavior', () => {
    it('should call onDismiss after duration', () => {
      const onDismiss = jest.fn()

      render(
        <SnackBar
          visible={true}
          message="Test message"
          duration={100}
          onDismiss={onDismiss}
        />
      )

      act(() => {
        jest.advanceTimersByTime(200)
      })

      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('should use custom duration when provided', () => {
      const onDismiss = jest.fn()
      const customDuration = 300

      render(
        <SnackBar
          visible={true}
          message="Test message"
          duration={customDuration}
          onDismiss={onDismiss}
        />
      )

      act(() => {
        jest.advanceTimersByTime(customDuration - 100)
      })
      expect(onDismiss).not.toHaveBeenCalled()

      act(() => {
        jest.advanceTimersByTime(200)
      })
      expect(onDismiss).toHaveBeenCalled()
    })

    it('should handle position prop correctly', () => {
      const { rerender, getByTestId } = render(
        <SnackBar
          visible={true}
          message="Test message"
          position="top"
          testID="snackbar"
          onDismiss={() => jest.fn()}
        />
      )

      expect(getByTestId('snackbar')).toBeTruthy()

      rerender(
        <SnackBar
          visible={true}
          message="Test message"
          position="bottom"
          testID="snackbar"
          onDismiss={() => jest.fn()}
        />
      )

      expect(getByTestId('snackbar')).toBeTruthy()
    })
  })

  describe('Animations', () => {
    it('should trigger animation when becoming visible', () => {
      const { rerender } = render(
        <SnackBar
          visible={false}
          message="Test message"
          onDismiss={() => jest.fn()}
        />
      )

      const animatedSpy = jest.spyOn(Animated, 'parallel')

      rerender(
        <SnackBar
          visible={true}
          message="Test message"
          onDismiss={() => jest.fn()}
        />
      )

      expect(animatedSpy).toHaveBeenCalled()
    })
  })

  describe('Style Customization', () => {
    it('should apply custom container styles', () => {
      const customStyle = { backgroundColor: 'red' }
      const { getByTestId } = render(
        <SnackBar
          visible={true}
          message="Test message"
          style={customStyle}
          testID="snackbar"
          onDismiss={() => jest.fn()}
        />
      )

      const snackbar = getByTestId('snackbar')

      const flattenedStyle = StyleSheet.flatten(snackbar.props.style)
      expect(flattenedStyle.backgroundColor).toBe('red')
    })

    it('should apply custom text styles', () => {
      const customTextStyle = { color: 'blue' }
      const { getByTestId } = render(
        <SnackBar
          visible={true}
          message="Test message"
          textStyle={customTextStyle}
          onDismiss={() => jest.fn()}
        />
      )

      const snackbarText = getByTestId('snackbar-message')
      expect(snackbarText.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining(customTextStyle)])
      )
    })
  })
})
