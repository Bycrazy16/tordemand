import React, { useState } from "react";
import { Box, Select, Input, Button, VStack, HStack, Link, Text } from "@chakra-ui/react";

function App() {
  const [type, setType] = useState("games");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await fetch(`http://localhost:6969/api/results?type=${type}&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box p={8} maxW="800px" mx="auto">
      <VStack spacing={4} align="stretch">
        <HStack spacing={2}>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="games">Games</option>
            <option value="movies">Movies</option>
          </Select>
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button colorScheme="blue" onClick={handleSearch}>Search</Button>
        </HStack>

        {results.map((item, idx) => (
          <Box key={idx} borderWidth="1px" borderRadius="md" p={4}>
            <Link href={item.page} color="blue.500" isExternal fontWeight="bold">
              {item.title}
            </Link>
            <Text>Provider: {item.provider}</Text>
            <HStack mt={2} spacing={2}>
              {item.links.map((link, i) => (
                <Button
                  key={i}
                  size="sm"
                  colorScheme="green"
                  as="a"
                  href={link}
                  target="_blank"
                >
                  Install {i + 1}
                </Button>
              ))}
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default App;
