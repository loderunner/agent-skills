package fixture

func Write(w io.Writer, buf []byte) error {
	_, err := w.Write(buf)
	if err != nil {
		return fmt.Errorf("write failed: %w", err)
	}

	return nil
}
