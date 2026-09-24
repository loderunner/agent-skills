package fixture

func logOnly(items []string) {
	for _, item := range items {
		err := process(item)
		if err != nil {
			log.Printf("skipping %s: %v", item, err)
			continue
		}

		recordDone(item)
	}
}
