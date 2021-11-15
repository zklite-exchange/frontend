import React from "react";
// css
import "./SpotBox.css";
// assets
import threeDotIcon from "../../../assets/icons/threedot-icon.png";
import SpotForm from "../../../utills/SpotForm/SpotForm";

class SpotBox extends React.Component {
  constructor(props) {
      super(props);
      this.state = { orderType: 'market' }
  }

  updateOrderType(orderType) {
      const newstate = { ...this.state, orderType }
      this.setState(newstate);
  }

  orderTypeTabClassName(orderType) {
     return this.state.orderType === orderType ? "trade_price_active_tab" : "";
  }

  render() {
      return (
        <>
          <div className="spot_box">
            <div className="spot_head">
              <div className="sh_l">
                <h2>SPOT</h2>
              </div>
              <div className="sh_r">
                <img src={threeDotIcon} alt="..." />
              </div>
            </div>
            <div className="spot_tabs">
              <div className="st_l">
                <h2 className={this.orderTypeTabClassName("limit")} onClick={() => this.updateOrderType("limit")}>Limit</h2>
                <h2 className={this.orderTypeTabClassName("market")} onClick={() => this.updateOrderType("market")}>Market</h2>
              </div>
            </div>
            <div className="spot_bottom">
              <SpotForm
                side="b"
                lastPrice={this.props.lastPrice}
                signInHandler={this.props.signInHandler}
                user={this.props.user}
                chainId={this.props.chainId}
                currentMarket={this.props.currentMarket}
                orderType={this.state.orderType}
              />
              <SpotForm
                side="s"
                lastPrice={this.props.lastPrice}
                signInHandler={this.props.signInHandler}
                user={this.props.user}
                chainId={this.props.chainId}
                currentMarket={this.props.currentMarket}
                orderType={this.state.orderType}
              />
            </div>
          </div>
        </>
      );
  }

}

export default SpotBox;
