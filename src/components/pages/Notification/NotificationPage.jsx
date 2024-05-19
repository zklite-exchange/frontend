import { DefaultTemplate } from "../../templates/DefaultTemplate";
import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { TelegramIcon } from "../../atoms/Svg";
import IconCopy from "../../atoms/Svg/Icons/Copy";
import Loader from "react-loader-spinner";
import { registerDevice } from "../../../lib/utils";
import chatbot_enable from "assets/images/chatbot_enable.png";

const NotificationRoot = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    padding: 0 2rem;

    pre {
        display: block;
        max-width: 100%;
        overflow: auto;
        padding: 1rem 1em;
        width: fit-content;
        color: ${({ theme }) => theme.colors.successHighEmphasis};
        font-weight: bold;
        background: color(srgb 0.968 0.96549 0.954196 / 0.04);
        border-radius: 4px;
        border-color: rgb(229, 231, 235);
        position: relative;

        button {
            display: block;
        }
    }
`;

export function NotificationPage() {
  const [deviceAlias, setDeviceAlias] = useState();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    registerDevice().then((res) => setDeviceAlias(res.deviceAlias));
  }, []);

  const command = `/notification enable ${deviceAlias}`
  const copyCommand = async () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(command);
    } else {
      // Use the 'out of viewport hidden text area' trick
      const textArea = document.createElement("textarea");
      textArea.value = command;

      // Move textarea out of the viewport so it's not visible
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";

      document.body.prepend(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
      } catch (error) {
        console.error(error);
      } finally {
        textArea.remove();
      }
    }
    setCopied(true);
  }
  return <DefaultTemplate>
    <Helmet>
      <title>Notification | zkLite Exchange</title>
    </Helmet>
    <NotificationRoot>
      <div className="w-full max-w-screen-lg mx-auto [&_a]:text-amber-400">

        <p className="mt-10 mb-5 text-3xl font-semibold font-work ">
          <TelegramIcon className="inline-block" size={32} /> Order Notification
        </p>
        {
          deviceAlias
            ? <>
            <p className="text-base">
              You can receive real-time order updates from zkLite Exchange via our Telegram ChatBot.
            </p>
            <br />
            <p className="text-base">
              To register, first copy this message:
            </p>
            <center className="mt-2">
              <pre>{command}</pre>
              <button className="mt-2 px-2 py-1" onClick={copyCommand}>
                {copied ? "Copied" : "Copy"} <IconCopy width={16} height={16} className="inline-block" />
              </button>
            </center>
            <p className="text-base mt-2">
              Then paste it into zkLite Exchange's ChatBot:
            </p>
            <a href="https://t.me/zklite_io_bot">
              <center className="mt-2 text-lg mb-10">
                https://t.me/zklite_io_bot
                <img src={chatbot_enable} alt="Chatbot screenshot" className="mt-2" />
              </center>
            </a>
          </>

          : <center className="mt-10">
              <Loader type="TailSpin" color="#FFF" height={24} width={24} />
            </center>
        }
      </div>
    </NotificationRoot>
  </DefaultTemplate>;
}