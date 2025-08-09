import { Colors } from "@theme/types";
import { StyleSheet } from "react-native";

export const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    marginTop: 12,
    paddingTop: 4,
  },
  input: {
    height: 32,
    fontSize: 16,
    color: colors.text,
    padding: 0,
    marginTop: 8,
  },
  focusedInput: {
    color: colors.primary,
  },
  errorInput: {
    color: colors.alert,
  },
  label: {
    backgroundColor: 'transparent',
  },
  underline: {
    borderBottomColor: colors.underline,
    borderBottomWidth: 0.2
  },
  focusedUnderline: {
    height: 1,
    backgroundColor: colors.underline,
  },
  errorUnderline: {
    backgroundColor: colors.alert,
  },
  errorText: {
    color: colors.alert,
    fontSize: 12,
    marginTop: 4,
  },
});