import { Typography } from '@components/ui'
import { styles } from '@components/ui/Typography/styles'
import { TypographyVariant, ValueFormat } from '@components/ui/Typography/types'
import { render } from '@testing-library/react-native'
import React from 'react'

jest.mock('@common/utils/currencyUtils', () => ({
  formatCurrency: jest.fn((value) => `R$ ${value},00`),
}))

describe('Typography Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { getByText } = render(<Typography>Test Text</Typography>)

      const textElement = getByText('Test Text')
      expect(textElement).toBeTruthy()
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          styles.body,
          expect.objectContaining({
            color: '#000000',
            fontWeight: 'normal',
          }),
        ])
      )
    })

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <Typography testID="custom-text">Test Text</Typography>
      )

      expect(getByTestId('custom-text')).toBeTruthy()
    })
  })

  describe('Variants', () => {
    const variants: TypographyVariant[] = ['label', 'body', 'title', 'header']

    variants.forEach((variant) => {
      it(`should apply correct style for ${variant} variant`, () => {
        const { getByText } = render(
          <Typography variant={variant}>Test Text</Typography>
        )

        const textElement = getByText('Test Text')
        expect(textElement.props.style).toEqual(
          expect.arrayContaining([styles[variant], expect.any(Object)])
        )
      })
    })
  })

  describe('Formatting', () => {
    it('should format currency values correctly', () => {
      const value = 1000
      const { getByText } = render(
        <Typography format={ValueFormat.CURRENCY}>{value}</Typography>
      )

      expect(getByText('R$1000,00')).toBeTruthy()
    })

    it('should not format text when format is TEXT', () => {
      const text = 'Test Text'
      const { getByText } = render(
        <Typography format={ValueFormat.TEXT}>{text}</Typography>
      )

      expect(getByText(text)).toBeTruthy()
    })
  })

  describe('Styling', () => {
    it('should apply custom color', () => {
      const customColor = '#FF0000'
      const { getByText } = render(
        <Typography color={customColor}>Test Text</Typography>
      )

      const textElement = getByText('Test Text')
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            color: customColor,
          }),
        ])
      )
    })

    it('should apply bold style when bold prop is true', () => {
      const { getByText } = render(<Typography bold>Test Text</Typography>)

      const textElement = getByText('Test Text')
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontWeight: 'bold',
          }),
        ])
      )
    })

    it('should apply custom margins and padding', () => {
      const marginBottom = 10
      const paddingHorizontal = 15

      const { getByText } = render(
        <Typography
          marginBottom={marginBottom}
          paddingHorizontal={paddingHorizontal}
        >
          Test Text
        </Typography>
      )

      const textElement = getByText('Test Text')
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            marginBottom,
            paddingHorizontal,
          }),
        ])
      )
    })

    it('should apply custom text alignment', () => {
      const { getByText } = render(
        <Typography align="center">Test Text</Typography>
      )

      const textElement = getByText('Test Text')
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            textAlign: 'center',
          }),
        ])
      )
    })

    it('should apply custom style prop', () => {
      const customStyle = { opacity: 0.5 }
      const { getByText } = render(
        <Typography style={customStyle}>Test Text</Typography>
      )

      const textElement = getByText('Test Text')
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([customStyle])
      )
    })
  })

  describe('Theme Integration', () => {
    it('should use theme text color when no color prop is provided', () => {
      const { getByText } = render(<Typography>Test Text</Typography>)

      const textElement = getByText('Test Text')
      expect(textElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            color: '#000000', // Theme default color from mock
          }),
        ])
      )
    })
  })
})
