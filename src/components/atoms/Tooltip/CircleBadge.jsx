import React from "react";
import styled from "styled-components";

const StyledDiv = styled.div`
    border-radius: 50%;
    position: absolute;
    top: -5px;
    right: -10px;
`;

export default function CircleBadge({
                                      size = "8px",
                                      color = "red",
                                      showBadge = true,
                                      children,
                                      ...props
                                    }) {
  return <div className="relative" {...props}>
    {children}
    {showBadge ? <StyledDiv style={{ width: size, height: size, background: color }} ></StyledDiv> : <></>}
  </div> ;
}