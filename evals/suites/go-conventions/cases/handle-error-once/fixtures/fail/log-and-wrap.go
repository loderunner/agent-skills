package fixture

func save(path string, data []byte) error {
	err := os.WriteFile(path, data, 0o600)
	if err != nil {
		log.Printf("save %s: %v", path, err)

		return fmt.Errorf("save %s: %w", path, err)
	}

	return nil
}
