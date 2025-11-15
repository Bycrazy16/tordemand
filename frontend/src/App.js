import React, { useState } from "react";
import {
  Box,
  Select,
  Input,
  Button,
  VStack,
  HStack,
  Link,
  Text,
  Image,
  Spinner,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { motion, AnimatePresence } from "framer-motion";

// Motion wrappers for animation
const MotionBox = motion(Box);
const MotionImage = motion(Image);

const PORT = process.env.REACT_APP_API_PORT;

function App() {
  /** ----------------------------
   *  STATE VARIABLES
   *  ----------------------------
   */
  const [type, setType] = useState("games"); // Search category
  const [query, setQuery] = useState(""); // Search input
  const [results, setResults] = useState([]); // Array of search results
  const [searched, setSearched] = useState(false); // Hide logo after first search
  const [loading, setLoading] = useState(false); // Loading spinner
  const [transitioning, setTransitioning] = useState(false); // Used for fade animation

  /** ----------------------------
   *  EVENT HANDLERS
   *  ----------------------------
   */

  // Trigger search on Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Trigger search on button click
  const handleSearch = async () => {
    if (!query.trim() || loading) return;

    setSearched(true);

    // Fade out previous results
    if (results.length > 0) {
      setTransitioning(true);
      await new Promise((r) => setTimeout(r, 300));
      setResults([]);
      await new Promise((r) => setTimeout(r, 300));
    }

    fetchResults(query);
  };

  /** ----------------------------
   *  FETCH SEARCH RESULTS
   *  ----------------------------
   */
  const fetchResults = async (q) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:${PORT}/api/results?type=${type}&q=${encodeURIComponent(q)}`
      );
      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();

      // Normalize results and add unique _key
      const keyed = Array.isArray(data)
        ? data.map((item, idx) => ({
            ...item,
            _key: `${q}-${idx}`,
            // Convert string links to objects with url + type
            links: item.links.map((url) =>
              typeof url === "string" ? { url, type: item.type } : url
            ),
          }))
        : [];

      setResults(keyed);
    } catch (err) {
      console.error("Fetch error:", err);
      setResults([]);
    } finally {
      setLoading(false);
      setTransitioning(false);
    }
  };

  /** ----------------------------
   *  TORRENT HANDLING FUNCTION
   *  ----------------------------
   */
  const openTorrent = async (linkObj) => {
    const { url, type } = linkObj;
    try {
      if (type === ".magnet") {
        // Open magnet link directly
        window.location.href = url;
      } else if (type === ".torrent") {
        // Download torrent file
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error downloading torrent file");

        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "file.torrent";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
      } else if (type === "redirect") {
        // Open redirect link in new tab
        window.open(url, "_blank");
      } else {
        // Fallback
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Error handling torrent link:", err);
    }
  };

  /** ----------------------------
   *  UI RENDERING
   *  ----------------------------
   */
  return (
    <Box p={6} maxW="800px" mx="auto" textAlign="center">
      <VStack spacing={4} align="stretch">
        {/* ----------------------------
            Logo with collapse animation
            ---------------------------- */}
        <Box
          h={searched ? "0px" : "400px"}
          display="flex"
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
          transition="height 0.6s ease"
        >
          <AnimatePresence>
            {!searched && (
              <MotionImage
                key="logo"
                src="/logo.png"
                alt="Logo"
                boxSize="400px"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.7 }}
              />
            )}
          </AnimatePresence>
        </Box>

        {/* ----------------------------
            App title
            ---------------------------- */}
        <MotionBox
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          textAlign="center"
          mb={4}
        >
          <Text fontSize="3xl" fontWeight="bold">
            TorDemand
          </Text>
        </MotionBox>

        {/* ----------------------------
            Search bar
            ---------------------------- */}
        <HStack spacing={2} justify="center">
          <Select value={type} onChange={(e) => setType(e.target.value)} w="150px">
            <option value="games">Games</option>
            <option value="movies">Movies</option>
          </Select>

          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            w="300px"
          />

          <Button colorScheme="blue" onClick={handleSearch} isLoading={loading}>
            <SearchIcon />
          </Button>
        </HStack>

        {/* ----------------------------
            Loading spinner
            ---------------------------- */}
        {loading && (
          <Box textAlign="center" py={3}>
            <Spinner size="lg" />
          </Box>
        )}

        {/* ----------------------------
            Search results
            ---------------------------- */}
        <AnimatePresence mode="wait">
          {results.length > 0 && !transitioning && (
            <MotionBox
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              {results.map((item) => (
                <MotionBox
                  key={item._key}
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                  mb={2}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Title linking to provider page */}
                  <Link href={item.page} color="blue.500" isExternal fontWeight="bold">
                    {item.title}
                  </Link>

                  {/* Provider name */}
                  <Text>Provider: {item.provider}</Text>

                  {/* Buttons for each link */}
                  <HStack mt={2} spacing={2} justify="center">
                    {item.links?.map((linkObj, i) => (
                      <Button
                        key={i}
                        size="sm"
                        colorScheme="green"
                        onClick={() => openTorrent(linkObj)}
                      >
                        {linkObj.type} {/* Show type inside button */}
                      </Button>
                    ))}
                  </HStack>
                </MotionBox>
              ))}
            </MotionBox>
          )}
        </AnimatePresence>
      </VStack>
    </Box>
  );
}

export default App;
