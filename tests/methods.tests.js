import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Shops } from '/imports/api/shops';
import { Menus } from '/imports/api/menus';
import '/imports/api/methods';

if (Meteor.isServer) {
  describe('Methods', function () {
    describe('Shops', function () {
      let shopId;

      beforeEach(async function () {
        await Shops.removeAsync({});
        await Menus.removeAsync({});
        shopId = await Shops.insertAsync({ name: 'Test Shop' });
      });

      it('shops.insert should create a new shop', async function () {
        const newShopId = await Meteor.callAsync('shops.insert', 'New Shop');
        const shop = await Shops.findOneAsync(newShopId);
        assert.equal(shop.name, 'New Shop');
        assert.isNotNull(shop.createdAt);
      });

      it('shops.updateName should rename a shop', async function () {
        await Meteor.callAsync('shops.updateName', shopId, 'Renamed Shop');
        const shop = await Shops.findOneAsync(shopId);
        assert.equal(shop.name, 'Renamed Shop');
      });

      it('shops.remove should delete a shop and its menus', async function () {
        await Menus.insertAsync({ shopId, name: 'Test Menu', count: 0 });
        await Meteor.callAsync('shops.remove', shopId);
        
        const shop = await Shops.findOneAsync(shopId);
        const menuCount = await Menus.find({ shopId }).countAsync();
        
        assert.isUndefined(shop);
        assert.equal(menuCount, 0);
      });
    });

    describe('Menus', function () {
      let shopId;
      let menuId;

      beforeEach(async function () {
        await Shops.removeAsync({});
        await Menus.removeAsync({});
        shopId = await Shops.insertAsync({ name: 'Test Shop' });
        menuId = await Menus.insertAsync({ shopId, name: 'Test Menu', count: 0 });
      });

      it('menus.insert should create a new menu', async function () {
        const newMenuId = await Meteor.callAsync('menus.insert', shopId, 'New Menu');
        const menu = await Menus.findOneAsync(newMenuId);
        assert.equal(menu.name, 'New Menu');
        assert.equal(menu.shopId, shopId);
      });

      it('menus.updateName should rename a menu', async function () {
        await Meteor.callAsync('menus.updateName', menuId, 'Renamed Menu');
        const menu = await Menus.findOneAsync(menuId);
        assert.equal(menu.name, 'Renamed Menu');
      });

      it('menus.remove should delete a menu', async function () {
        await Meteor.callAsync('menus.remove', menuId);
        const menu = await Menus.findOneAsync(menuId);
        assert.isUndefined(menu);
      });

      it('menus.incCount should increment count', async function () {
        await Meteor.callAsync('menus.incCount', menuId, 1);
        let menu = await Menus.findOneAsync(menuId);
        assert.equal(menu.count, 1);

        await Meteor.callAsync('menus.incCount', menuId, 1);
        menu = await Menus.findOneAsync(menuId);
        assert.equal(menu.count, 2);
      });

      it('menus.incCount should decrement count but not below 0', async function () {
        await Meteor.callAsync('menus.incCount', menuId, 1); // 1
        await Meteor.callAsync('menus.incCount', menuId, -1); // 0
        let menu = await Menus.findOneAsync(menuId);
        assert.equal(menu.count, 0);

        await Meteor.callAsync('menus.incCount', menuId, -1); // 0 (min limit)
        menu = await Menus.findOneAsync(menuId);
        assert.equal(menu.count, 0);
      });

       it('menus.incCount should not exceed 999', async function () {
         // Create a menu with 999 count
         await Menus.updateAsync(menuId, { $set: { count: 999 } });
         
         await Meteor.callAsync('menus.incCount', menuId, 1);
         const menu = await Menus.findOneAsync(menuId);
         assert.equal(menu.count, 999);
       });

      it('menus.resetCountsByShop should reset all menus in shop to 0', async function () {
        await Menus.updateAsync(menuId, { $set: { count: 5 } });
        await Menus.insertAsync({ shopId, name: 'Another Menu', count: 3 });
        
        await Meteor.callAsync('menus.resetCountsByShop', shopId);
        
        const menus = await Menus.find({ shopId }).fetchAsync();
        menus.forEach(m => assert.equal(m.count, 0));
      });
    });
  });
}
