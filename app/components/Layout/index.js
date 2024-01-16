import { useEffect, useState } from "react";
import Head from "next/head";
import Script from "next/script";
import { useMoralis } from "react-moralis";
import NavBar from "../NavBar";
import SideNav from "../SideNav";
import styles from "../../styles/Home.module.css";
import { Flex, Box, Text, Link, Spinner } from "@chakra-ui/react";

export default function Layout({ children }) {
  const { isInitialized } = useMoralis();
  const [isMobile, onMobile] = useState(false);

  useEffect(() => {
    if (window) {
      toggleMobileMode();
      window.addEventListener("resize", toggleMobileMode);
    }
  });

  function toggleMobileMode() {
    if (window.innerWidth < 800) {
      onMobile(true);
    } else {
      onMobile(false);
    }
  }

  return (
    <Flex direction="column" height="100vh">
      <Head>
        <title>ECH Learn-2-Earn</title>
        <meta
          name="description"
          content="Learn about Ethereum and get rewarded."
        />
        <link rel="icon" href="/ECHLogo.png" />
      </Head>
      {/* <!-- Google tag (gtag.js) --> */}
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=G-${process.env.GoogleTagId}`}
      />
      <Script
        id="gtag-init"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-${process.env.GoogleTagId}');
          `,
        }}
      />

      <Box flexGrow={1}>
        <NavBar isMobile={isMobile} />
        <Flex direction="row">
          <Box minW={250} ml={20} hidden={isMobile}>
            <SideNav isMobile={isMobile} />
          </Box>
          {isInitialized ? (
            <Box flexGrow={1} mr={isMobile ? 0 : 20} height="100%">
              {children}
            </Box>
          ) : (
            <Flex width="100%" height="100%" justify="center" align="center">
              <Spinner width={200} height={200} />
            </Flex>
          )}
        </Flex>
      </Box>

      <footer className={styles.footer}>
        <a
          href="https://www.ethereumcatherders.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textAlign: "center" }}
        >
          Made with ❤️ from the Ethereum Cat Herders
        </a>
        <Flex gap={1}>
          <Text>Please share your feedback</Text>
          <Link
            href="https://forms.gle/hGrMsGrStk9z7xc27"
            isExternal
            textDecor="underline"
          >
            here
          </Link>
        </Flex>
      </footer>
    </Flex>
  );
}
