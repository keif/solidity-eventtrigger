import { useEffect, useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
// import Contract from "./Contract";
// import ContractBtns from "./ContractBtns";
// import Cta from "./Cta";
// import Desc from "./Desc";
import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";
import Title from "./Title";

function Demo() {
  const { state } = useEth();
  const [value, setValue] = useState("?");
  const [cost, setCost] = useState(0);
  const [itemName, setItemName] = useState(`exampleItem1`);
  const [loaded, setLoaded] = useState(false);

  console.group(`demo`);
  console.log(`state.artifacts:`, state.artifacts);
  console.log(`state.contract:`, state.contract);
  console.log(`state.accounts:`, state.accounts)
  console.groupEnd();

  // original code if I want to refactor
  // const demo =
  //   <>
  //     <Cta />
  //     <div className="contract-container">
  //       <Contract value={value} />
  //       <ContractBtns setValue={setValue} />
  //     </div>
  //     <Desc />
  //   </>;

  const handleSubmit = async () => {
    console.group(`handleSubmit`);
    console.log(itemName, cost, state.contract);
    const result = await state.contract.methods.createItem(itemName, cost)
      .send({ from: state.accounts[0] });
    console.log(result);
    console.groupEnd();
    // alert(`Send ${cost} Wei to ${result.events.SupplyChainStep.returnValues._address}`);
  };

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    return value;
  }

  const handleInputCostChange = (event) => {
    setCost(handleInputChange(event));
  }

  const handleInputItemNameChange = (event) => {
    setItemName(handleInputChange(event));
  }

  const example =
    <>
      <h3>Items</h3>
      <h4>Add Element</h4>
      Cost: <input type="text" name="cost" value={cost} onChange={handleInputCostChange} />
      Item Name: <input type="text" name="itemName" value={itemName} onChange={handleInputItemNameChange} />
      <button type="button" onClick={handleSubmit}>Create new Item</button>
    </>

  useEffect(() => {
    listenToPaymentEvent();
    // remove listener when the component is unmounted
    return () => {
      state.contract?.events?.removeAllListeners('block')
    }
  }, [state]);

  const listenToPaymentEvent = () => {
    console.group(`listenToPaymentEvent`);
    console.log(state?.contract?.events);
    console.groupEnd();
    if (state.contract?.events) {
      console.log(`event is being monitored`);
      state.contract.events.SupplyChainStep()
        .on(`connected`, (subscriptionId) => console.log(`subscriptionId:`, subscriptionId))
        .on(`data`, async function (evt) {
          console.log(`on data evt:`, evt);
          if (evt.returnValues._step === 1) {
            const item = await state.contract.methods.items(evt.returnValues._itemIndex).call();
            console.log(item);
            alert("Item " + item._identifier + " was paid, deliver it now!");
          };
          console.log(evt);
        })
        .on(`changed`, (evt) => console.log(`changed event:`, evt))
        .on(`error`, (err) => console.error(`supply chain step error:`, err));
    }
  }

  return (
    <div className="demo">
      <Title />
      {
        !state?.artifacts && state.artifacts?.length === 0 ? <NoticeNoArtifact /> :
          !state.contract ? <NoticeWrongNetwork /> :
            // demo
            example
      }
    </div>
  );
}

export default Demo;
