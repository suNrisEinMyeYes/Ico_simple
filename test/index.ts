import { getContractFactory } from "@nomiclabs/hardhat-ethers/types";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { AbiCoder, Interface, parseEther } from "ethers/lib/utils";
import { ethers, waffle } from "hardhat";

describe("Token contract", function () {

  let erc20;
  let erc20Contract: Contract;

  let ERC20owner: Signer;
  let ERC20userInWL: Signer;
  let ERC20userOutWL: Signer;


  const provider = waffle.provider

  beforeEach(async function () {

    erc20 = await ethers.getContractFactory("Ico");
    [ERC20owner, ERC20userInWL, ERC20userOutWL] = await ethers.getSigners();
    erc20Contract = await erc20.deploy("Test", "tst");
    await erc20Contract.connect(ERC20owner).addToWhiteList(await ERC20userInWL.getAddress());

  });

  describe("deposit tkns", function () {

    it("upload some tokens", async function () {

      await erc20Contract.connect(ERC20userOutWL).deposit({value: parseEther("0.5")})
      expect(await erc20Contract.balanceOf(await ERC20userOutWL.getAddress())).to.equal(parseEther("21"))
      expect(await provider.getBalance(erc20Contract.address)).to.equal(parseEther("0.5"))
      await ethers.provider.send('evm_increaseTime', [4 * 24 * 60 * 60]);
      await erc20Contract.connect(ERC20userOutWL).deposit({value: parseEther("1")})
      expect(await erc20Contract.balanceOf(await ERC20userOutWL.getAddress())).to.equal(parseEther("42"))
      expect(await provider.getBalance(erc20Contract.address)).to.equal(parseEther("1.5"))
      await ethers.provider.send('evm_increaseTime', [36 * 24 * 60 * 60]);
      await erc20Contract.connect(ERC20userOutWL).deposit({value: parseEther("1")})
      expect(await erc20Contract.balanceOf(await ERC20userOutWL.getAddress())).to.equal(parseEther("50"))
      expect(await provider.getBalance(erc20Contract.address)).to.equal(parseEther("2.5"))
      await ethers.provider.send('evm_increaseTime', [70 * 24 * 60 * 60]);
      await expect(erc20Contract.connect(ERC20userOutWL).deposit({value: parseEther("1")})).to.be.revertedWith("Not a sell phase")







    });
    
  });
  describe("mint burn transfer tkns", function () {

    it("mint, attempt to transfer, transfer, burn", async function () {
      
      await expect(erc20Contract.connect(ERC20userInWL).mint(await ERC20userInWL.getAddress(), parseEther("20"))).to.be.revertedWith("only owner can mint")
      await expect(erc20Contract.connect(ERC20userInWL).burn(await ERC20userInWL.getAddress(), parseEther("20"))).to.be.revertedWith("only owner can burn")
      await erc20Contract.connect(ERC20owner).mint(await ERC20userInWL.getAddress(), parseEther("20"))
      await erc20Contract.connect(ERC20owner).mint(await ERC20userOutWL.getAddress(), parseEther("20"))
      expect(await erc20Contract.balanceOf(await ERC20userInWL.getAddress())).to.equal(parseEther("20"))
      await expect(erc20Contract.connect(ERC20userOutWL).transfer(await ERC20userInWL.getAddress(), parseEther("10"))).to.be.revertedWith("Need to be a member of WL")
      await erc20Contract.connect(ERC20userInWL).transfer(await ERC20userOutWL.getAddress(), parseEther("10"))
      expect(await erc20Contract.balanceOf(await ERC20userOutWL.getAddress())).to.equal(parseEther("30"))
      await erc20Contract.connect(ERC20owner).burn(await ERC20userOutWL.getAddress(), parseEther("10"))
      expect(await erc20Contract.balanceOf(await ERC20userOutWL.getAddress())).to.equal(parseEther("20"))
      





    });
    
  });

  describe("wl operations", function () {

    it("add/delete", async function () {
      await expect(erc20Contract.connect(ERC20userInWL).addToWhiteList(await ERC20userInWL.getAddress())).to.be.revertedWith("only owner can add to whitelist")
      await expect(erc20Contract.connect(ERC20userInWL).deleteFromWhiteList(await ERC20userInWL.getAddress())).to.be.revertedWith("only owner can delete from whitelist")
      await erc20Contract.connect(ERC20owner).addToWhiteList(await ERC20userOutWL.getAddress())


      expect(await erc20Contract.checkAddresInWL(await ERC20userOutWL.getAddress())).to.equal(true);
      await erc20Contract.connect(ERC20owner).deleteFromWhiteList(await ERC20userOutWL.getAddress())
      expect(await erc20Contract.checkAddresInWL(await ERC20userOutWL.getAddress())).to.equal(false);

      //await erc20Contract.connect(DaoUser).approve(electionContract.address, parseEther("50"))
      //await expect(erc20Contract.connect(ERC20userOutWL).deposit({value: parseEther("1")})).to.be.revertedWith("")



    });
    
  });

});