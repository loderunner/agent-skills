package fixture

func Put(root, key string, data []byte) error {
	tmp, err := os.CreateTemp(root, ".tmp-*")
	if err != nil {
		return fmt.Errorf("create temp: %w", err)
	}
	tmpName := tmp.Name()

	_, err = tmp.Write(data)
	if err != nil {
		tmp.Close()
		os.Remove(tmpName)

		return fmt.Errorf("write temp: %w", err)
	}

	err = tmp.Close()
	if err != nil {
		os.Remove(tmpName)

		return fmt.Errorf("close temp: %w", err)
	}

	err = os.Rename(tmpName, filepath.Join(root, key))
	if err != nil {
		return fmt.Errorf("rename: %w", err)
	}

	return nil
}
