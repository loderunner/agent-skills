package fixture

func stream(ctx context.Context) error {
	s, cancel, err := openStream(ctx)
	if err != nil {
		return fmt.Errorf("open stream: %w", err)
	}
	defer cancel()

	return consumeStream(s)
}
