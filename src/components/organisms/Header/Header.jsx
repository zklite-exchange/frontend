import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useHistory, useLocation } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import CheckIcon from "@mui/icons-material/Check";
import { userSelector } from "lib/store/features/auth/authSlice";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import { networkSelector } from "lib/store/features/api/apiSlice";
import api from "lib/api";
import logo_wide from "assets/images/logo_wide.png";
import zksyncLogo from "assets/images/networks/zksync-network.svg";
import arbitrumLogo from "assets/images/networks/arbitrum-network.svg";
import { TabMenu, Tab } from "components/molecules/TabMenu";
import { Dropdown, AccountDropdown } from "components/molecules/Dropdown";
import { ConnectWalletButton } from "components/molecules/Button";
import {
  ExternalLinkIcon,
  TelegramIcon,
  TwitterIcon,
  MenuIcon, GithubIcon
} from "components/atoms/Svg";
import LanguageDropdown from "./LangaugeDropdown";
import useTheme from "components/hooks/useTheme";
import {
  MdOutlineArticle,
  MdOutlineQuiz,
  MdOutlineContactMail,
} from "react-icons/md";
import { FaGithub } from "react-icons/fa";
import { HideMenuOnOutsideClicked, useWindowDimensions } from "lib/utils";
import CircleBadge from "../../atoms/Tooltip/CircleBadge";

const networkLists = [
  {
    text: "zkSync Lite",
    value: 1,
    url: "#",
    selectedIcon: <CheckIcon />,
    image: zksyncLogo,
    display: true,
  },
  {
    text: "Arbitrum",
    value: 42161,
    url: "https://arbitrum.zigzag.exchange/",
    selectedIcon: <CheckIcon />,
    image: arbitrumLogo,
    display: false,
  },
  {
    text: "zkSync - Goerli",
    value: 1002,
    url: "#",
    selectedIcon: <CheckIcon />,
    image: zksyncLogo,
    display: false,
  },
];

const supportLists = [
  //{
  //  text: "live_support",
  //  url: "https://discord.com/invite/zigzag",
  //  icon: <FaDiscord size={14} />,
  //},
  {
    text: "faq",
    url: "https://zigzag.exchange/#faq",
    icon: <MdOutlineQuiz size={14} />,
  },
  {
    text: "docs",
    url: "https://docs.zigzag.exchange/",
    icon: <MdOutlineArticle size={14} />,
  },
  {
    text: "GitHub",
    url: "https://github.com/zklite-exchange/",
    icon: <FaGithub size={14} />,
  },
  // {
  //   text: "uptime_status",
  //   url: "https://status.zigzag.exchange/",
  //   icon: <MdSignalCellularAlt size={14} />,
  // },
  {
    text: "contact",
    url: "https://t.me/zklite_exchange",
    icon: <MdOutlineContactMail size={14} />,
  },
];

const communityLists = [
  // {
  //   text: "governance",
  //   url: "https://forum.zigzaglabs.io/t/zigzag-exchange",
  //   icon: <MdAccountBalance size={14} />,
  // },
  {
    text: "Telegram",
    url: "https://t.me/zklite_exchange",
    icon: <TelegramIcon size={14} />,
  },
];

const HeaderWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  width: 100%;
  height: 56px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.foreground400};
  align-items: center;
  background-color: ${({ theme }) => theme.colors.backgroundHighEmphasis};
  position: fixed;
  padding: 0px 20px;
  z-index: 100;
  box-shadow: ${({ isMobile }) =>
    isMobile ? "0px 8px 16px 0px #0101011A" : ""};
  ${({ isMobile }) => (isMobile ? "backdrop-filter: blur(8px);" : "")}

  button {
    &:hover {
      // background-color: ${({ theme }) =>
        `${theme.colors.foregroundHighEmphasis} !important`};

      div {
        color: ${({ theme }) =>
          `${theme.colors.primaryHighEmphasis} !important`};

        svg path {
          fill: ${({ theme }) =>
            `${theme.colors.primaryHighEmphasis} !important`};
        }
      }
    }
  }
`;

const LogoWrapper = styled.div``;

const ButtonWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: end;
  gap: 19px;
`;

const MenuButtonWrapper = styled.div`
  cursor: pointer;
`;

const NavWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ActionsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-items: center;
`;

const SocialWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-items: center;
  width: 280px;
`;

const LanguageWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 27px;
`;

const SocialLink = styled.a`
  &:hover {
    svg path {
      fill: ${({ theme }) => `${theme.colors.primaryHighEmphasis} !important`};
    }
  }

  svg path {
      fill: ${({ theme }) => theme.colors.foregroundLowEmphasis};
  }
    svg {
        display: inline-block;
    }
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.foreground400};
`;

const SideMenuWrapper = styled.div`
  position: fixed;
  width: 320px;
  top: 0;
  left: 0;
  height: 100vh;
  max-height: ${props => `${props.windowHeight}px`};
  background: ${({ theme }) => theme.colors.backgroundLowEmphasis};
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.foreground400};
  backdrop-filter: blur(8px);
`;

const HorizontalDivider = styled.div`
  width: 229px;
  height: 1px;
  background: ${({ theme }) => theme.colors.foreground400};
`;

const ActionSideMenuWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  span {
    font-family: WorkSans-SemiBold;
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
  }
`;

const AlertMessage = styled.div`
  background: red;
  text-align: center;
  font-size: 16px;
`;

export const Header = (props) => {
  // state to open or close the sidebar in mobile

  const [show, setShow] = useState(false);
  const user = useSelector(userSelector);
  const network = useSelector(networkSelector);
  const hasBridge = api.isImplemented("depositL2");
  const isEVM = api.isEVMChain();
  const history = useHistory();
  const [index, setIndex] = useState(0);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const [networkName, setNetworkName] = useState("");
  const [networkItems, setNetWorkItems] = useState(
    networkLists.filter((n) => n.display)
  );
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    setShowNotificationBadge(localStorage.getItem('noti_badge') !== '0')
  }, []);

  useEffect(() => {
    const netName = networkLists.filter((item, i) => {
      return item.value === network;
    });
    setNetworkName(netName[0].text);
  });

  useEffect(() => {
    let temp = networkItems.reduce((acc, item) => {
      if (item.text === networkName) item["iconSelected"] = true;
      else item["iconSelected"] = false;
      acc.push(item);
      return acc;
    }, []);

    setNetWorkItems(temp);
  }, [networkName]);

  useEffect(() => {
    api.emit("connecting", props.isLoading);
    // setConnecting(props.isLoading)
  }, [props.isLoading]);

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        setIndex(0);
        break;
      case "/notification":
        setIndex(1);
        break;
      default:
        setIndex(-1);
        break;
    }
  }, []);

  const changeNetwork = async (text, value) => {
    setNetworkName(text);

    api.setAPIProvider(value);
    try {
      await api.refreshNetwork();
    } catch (err) {
      console.log(err);
    }

    if (
      (/^\/wrap(\/.*)?/.test(location.pathname) && !isEVM) ||
      (/^\/bridge(\/.*)?/.test(location.pathname) &&
        !api.isImplemented("depositL2")) ||
      (/^\/list-pair(\/.*)?/.test(location.pathname) && isEVM)
    ) {
      setIndex(0);
      history.push("/");
    }
  };

  const handleClick = (newIndex) => {
    switch (newIndex) {
      case 0:
        setIndex(newIndex);
        history.push("/");
        break;
      case 1:
        setIndex(newIndex);
        history.push("/notification");
        localStorage.setItem('noti_badge', '0');
        setShowNotificationBadge(false);
        break;
      case 2:
        window.open('https://lite.zksync.io/', "_blank");
        break;
      default:
        break;
    }
  };

  const isMobile = useMediaQuery({ maxWidth: 1224 });
  const {height: windowHeight} = useWindowDimensions()
  const navPanelRef = useRef(null)
  const navButtonRef = useRef(null)
  HideMenuOnOutsideClicked(navPanelRef, setShow, navButtonRef)

  return (
    <>
    <HeaderWrapper isMobile={isMobile}>
      {isMobile ? (
        <>
          <LogoWrapper>
            <Link to="/">
              <img src={logo_wide} alt="logo" style={{height: '32px', width: 'auto', maxWidth: 'none'}} />
            </Link>
          </LogoWrapper>
          <ButtonWrapper>
            {user.address ? (
              <>
                <AccountDropdown networkName={networkName} />
              </>
            ) : (
              <ConnectWalletButton />
            )}
            <MenuButtonWrapper ref={navButtonRef} >
              <CircleBadge showBadge={showNotificationBadge}>
                <MenuIcon onClick={() => setShow(!show)} />
              </CircleBadge>
            </MenuButtonWrapper>
          </ButtonWrapper>
        </>
      ) : (
        <>
          <NavWrapper>
            <Link to="/">
              <img src={logo_wide} alt="logo" style={{height: '32px', width: '93px', maxWidth: 'none'}} />
            </Link>
            <TabMenu
              className="grow"
              activeIndex={index}
              onItemClick={handleClick}
            >
              <Tab>{t("trade")}</Tab>
              <Tab><CircleBadge showBadge={showNotificationBadge}>NOTIFICATION</CircleBadge></Tab>
              <Tab>{t("bridge")} <ExternalLinkIcon size={12} /></Tab>
            </TabMenu>
          </NavWrapper>
          <ActionsWrapper>
            {/*<Dropdown*/}
            {/*  adClass="menu-dropdown"*/}
            {/*  width={200}*/}
            {/*  item={supportLists}*/}
            {/*  context={t("support")}*/}
            {/*  leftIcon={true}*/}
            {/*  transparent*/}
            {/*/>*/}
            {/*<Dropdown*/}
            {/*  adClass="menu-dropdown"*/}
            {/*  width={162}*/}
            {/*  item={communityLists}*/}
            {/*  context={t("community")}*/}
            {/*  leftIcon={true}*/}
            {/*  transparent*/}
            {/*/>*/}
            {/*<VerticalDivider />*/}
            <VerticalDivider />
            <SocialWrapper>
              {/*<SocialLink*/}
              {/*  target="_blank"*/}
              {/*  rel="noreferrer"*/}
              {/*  href="https://twitter.com/ZigZagExchange"*/}
              {/*>*/}
              {/*  <TwitterIcon />*/}
              {/*</SocialLink>*/}
              <SocialLink
                target="_blank"
                rel="noreferrer"
                href="https://github.com/zklite-exchange"
              >
                <span>Github <GithubIcon /></span>
              </SocialLink>
              <SocialLink
                target="_blank"
                rel="noreferrer"
                href="https://t.me/zklite_exchange"
              >
                <span>Telegram <TelegramIcon /></span>
              </SocialLink>
              <SocialLink
                target="_blank"
                rel="noreferrer"
                href="https://twitter.com/zklite_exchange"
              >
                <span>Twitter <TwitterIcon /></span>
              </SocialLink>
            </SocialWrapper>
            <VerticalDivider />
            <LanguageDropdown />
            <LanguageWrapper>
              {/* <StyledDropdown
                adClass="lang-dropdown"
                transparent
                item={langList}
                context={language}
                clickFunction={changeLanguage}
              /> */}
              {/*<ToggleTheme isDark={isDark} toggleTheme={toggleTheme} />*/}
            </LanguageWrapper>
            <VerticalDivider />

            <Dropdown
              adClass="network-dropdown"
              width={190}
              item={networkItems}
              context={networkName}
              clickFunction={changeNetwork}
              leftIcon={true}
            />

            {user.address ? (
              <AccountDropdown networkName={networkName} />
            ) : (
              <ConnectWalletButton />
            )}
          </ActionsWrapper>
        </>
      )}
      {show && isMobile ? (
        <SideMenuWrapper windowHeight={windowHeight} ref={navPanelRef}>
          <div style={{flexGrow: 1}}>
            <div style={{display: "grid", gap: '20px', marginTop: '10vh'}}>
              <Dropdown
                adClass="network-dropdown"
                isMobile={true}
                style={{ justifySelf: "center"}}
                width={200}
                item={networkItems}
                context={networkName}
                clickFunction={changeNetwork}
                leftIcon={true}
              />
              <LanguageDropdown />
              <TabMenu row activeIndex={index} onItemClick={handleClick}>
                <Tab>{t("trade")}</Tab>
                <Tab><CircleBadge showBadge={showNotificationBadge}>NOTIFICATION</CircleBadge></Tab>
                <Tab display={true}>{t("bridge")} <ExternalLinkIcon size={12} /></Tab>
              </TabMenu>
              {/*<HorizontalDivider />*/}
              {/* <ActionSideMenuWrapper>
            <span>Language: </span>
            <StyledDropdown
              adClass="lang-dropdown"
              transparent
              item={langList}
              context={language}
              clickFunction={changeLanguage}
            />
          </ActionSideMenuWrapper> */}
              {/*<ActionSideMenuWrapper>*/}
              {/*  <span>Theme: </span>*/}
              {/*  <ToggleTheme isDark={isDark} toggleTheme={toggleTheme} />*/}
              {/*</ActionSideMenuWrapper>*/}
              {/*<HorizontalDivider />*/}
              {/*<Dropdown*/}
              {/*  adClass="menu-dropdown"*/}
              {/*  width={200}*/}
              {/*  item={supportLists}*/}
              {/*  context={t("support")}*/}
              {/*  leftIcon={true}*/}
              {/*  transparent*/}
              {/*/>*/}
              {/*<Dropdown*/}
              {/*  adClass="menu-dropdown"*/}
              {/*  width={162}*/}
              {/*  item={communityLists}*/}
              {/*  context={t("community")}*/}
              {/*  leftIcon={true}*/}
              {/*  transparent*/}
              {/*/>*/}
            </div>
          </div>
          <SocialWrapper style={{ justifySelf: "center", marginBottom: "50px" }}>
            <SocialLink
              target="_blank"
              rel="noreferrer"
              href="https://github.com/zklite-exchange"
            >
              <span>Github <GithubIcon /></span>
            </SocialLink>
            <SocialLink
              target="_blank"
              rel="noreferrer"
              href="https://t.me/zklite_exchange"
            >
              <span>Telegram <TelegramIcon /></span>
            </SocialLink>
            <SocialLink
              target="_blank"
              rel="noreferrer"
              href="https://twitter.com/zklite_exchange"
            >
              <span>Twitter <TwitterIcon /></span>
            </SocialLink>
          </SocialWrapper>
        </SideMenuWrapper>
      ) : (
        <></>
      )}
    </HeaderWrapper>
    </>
  );
};
