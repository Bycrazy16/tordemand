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

// Motion wrappers for smooth animation effects
const MotionBox = motion(Box);
const MotionImage = motion(Image);

function App() {
  /** ----------------------------
   *  STATE VARIABLES
   *  ----------------------------
   */
  const [type, setType] = useState("games"); // Search category ("games" or "movies")
  const [query, setQuery] = useState(""); // Current search input
  const [results, setResults] = useState([]); // List of search results
  const [searched, setSearched] = useState(false); // True after first search (hides logo)
  const [loading, setLoading] = useState(false); // Loading indicator
  const [transitioning, setTransitioning] = useState(false); // Used for fade-out / fade-in animation

  /** ----------------------------
   *  EVENT HANDLERS
   *  ----------------------------
   */

  // Trigger search when pressing Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Main search handler (called on button click or Enter)
  const handleSearch = async () => {
    if (!query.trim() || loading) return; // Prevent empty or repeated searches

    setSearched(true); // Hide the logo on first search

    // If old results exist → fade them out first before loading new ones
    if (results.length > 0) {
      setTransitioning(true); // Start fade-out
      await new Promise((resolve) => setTimeout(resolve, 400)); // Wait 400ms (exit animation)
      setResults([]); // Clear previous results
      await new Promise((resolve) => setTimeout(resolve, 400)); // Wait again before fade-in
    }

    // Fetch new search results
    fetchResults(query);
  };

  /** ----------------------------
   *  FETCH SEARCH RESULTS
   *  ----------------------------
   *  Calls your backend API and retrieves results
   *  Example endpoint: http://localhost:6969/api/results
   */
  const fetchResults = async (q) => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:6969/api/results?type=${type}&q=${encodeURIComponent(q)}`
      );

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();

      // Add a unique _key to each result (important for React animations)
      const keyed = Array.isArray(data)
        ? data.map((item, idx) => ({ ...item, _key: `${q}-${idx}` }))
        : [];

      setResults(keyed); // Save the new results
    } catch (err) {
      console.error("Fetch error:", err);
      setResults([]); // Clear on error
    } finally {
      setLoading(false);
      setTransitioning(false);
    }
  };

  /** ----------------------------
   *  TORRENT HANDLING FUNCTION
   *  ----------------------------
   *  Handles three possible link types:
   *  1️⃣ magnet:? links → directly open via Torrent Control browser extension
   *  2️⃣ .torrent file → downloads the torrent without leaving the page
   *  3️⃣ any other link → opens normally in a new tab
   */
  const openTorrent = async (link, name = "file.torrent") => {
    try {
      // CASE 1: Magnet link → triggers torrent client through browser extension
      if (link.startsWith("magnet:")) {
        window.location.href = link; // Torrent Control will catch this
        return;
      }

      // CASE 2: Direct .torrent file download
      if (link.endsWith(".torrent")) {
        const res = await fetch(link);
        if (!res.ok) throw new Error("Error downloading torrent file");

        const blob = await res.blob(); // Convert response to binary
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); // Create temporary download link
        a.download = name;
        document.body.appendChild(a);
        a.click(); // Trigger download
        a.remove(); // Clean up element
        URL.revokeObjectURL(a.href); // Release memory
        return;
      }

      // CASE 3: Any other link → open in new tab (fallback)
      window.open(link, "_blank");
    } catch (err) {
      console.error("Error handling torrent link:", err);
    }
  };

  /** ----------------------------
   *  UI RENDERING
   *  ----------------------------
   */
  return (
    <Box p={8} maxW="800px" mx="auto" textAlign="center">
      <VStack spacing={6} align="stretch">
        {/* ----------------------------
            Animated logo before first search
            ---------------------------- */}
        <Box
          h={searched ? "0px" : "350px"} // Collapses after first search
          display="flex"
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
          transition="height 0.7s ease"
        >
          <AnimatePresence>
            {!searched && (
              <MotionImage
                key="logo"
                src="/logo.png"
                alt="Logo"
                boxSize="350px"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>
        </Box>

        {/* ----------------------------
            Search bar section
            ---------------------------- */}
        <HStack spacing={2} justify="center">
          {/* Select between games or movies */}
          <Select value={type} onChange={(e) => setType(e.target.value)} w="150px">
            <option value="games">Games</option>
            <option value="movies">Movies</option>
          </Select>

          {/* Text input for search query */}
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress} // Press Enter to search
            w="300px"
          />

          {/* Search button (blue, with spinner on loading) */}
          <Button colorScheme="blue" onClick={handleSearch} isLoading={loading}>
            <SearchIcon />
          </Button>
        </HStack>

        {/* ----------------------------
            Loading spinner while fetching
            ---------------------------- */}
        {loading && (
          <Box textAlign="center" py={4}>
            <Spinner size="lg" />
          </Box>
        )}

        {/* ----------------------------
            Search results with fade animations
            ---------------------------- */}
        <AnimatePresence mode="wait">
          {results.length > 0 && !transitioning && (
            <MotionBox
              key={query}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {results.map((item) => (
                <MotionBox
                  key={item._key}
                  borderWidth="1px"
                  borderRadius="md"
                  p={4}
                  mb={2}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Title link (opens provider page) */}
                  <Link
                    href={item.page}
                    color="blue.500"
                    isExternal
                    fontWeight="bold"
                  >
                    {item.title}
                  </Link>

                  {/* Provider name */}
                  <Text>Provider: {item.provider}</Text>

                  {/* Torrent buttons section */}
                  <HStack mt={2} spacing={2} justify="center">
                    {item.links?.map((link, i) => (
                      <Button
                        key={i}
                        size="sm"
                        colorScheme="green"
                        // Clicking the button triggers torrent control or download
                        onClick={() =>
                          openTorrent(link, `${item.title}-${i + 1}.torrent`)
                        }
                      >
                        Start {i + 1}
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
