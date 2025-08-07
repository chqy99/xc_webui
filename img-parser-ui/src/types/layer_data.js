// src/types/LayerData.js
export class LayerData {
  constructor({ uid, label, url, base64 }) {
    this.uid = uid
    this.label = label
    this.url = url
    this.base64 = base64

    this.units = []
    this.storage_units = []
    this.showMask = true
    this.showBBox = true
    this.selectedUnitIndex = null
  }

  /**
   * 设置工作单元 (用于加载新的解析结果)
   * 这不会更新 storage_units，从而可以和快照进行比较
   * @param {Array} units
   */
  setUnits(units) {
    this.units = units.map(u => ({ ...u }));
    // 注意：这里故意不更新 storage_units
  }

  /**
   * 设置存储单元 (用于从服务器加载已保存的数据)
   * 这会同时重置工作单元和快照，使它们保持同步
   * @param {Array} units
   */
  loadStorageUnits(units) {
    this.units = units.map(u => ({ ...u }));
    this.storage_units = JSON.parse(JSON.stringify(this.units));
  }

  getChanges() {
    const originalMap = Object.fromEntries(this.storage_units.map(u => [u.uid, u]))
    const currentMap = Object.fromEntries(this.units.map(u => [u.uid, u]))

    const add = this.units.filter(u => !originalMap[u.uid])
    const update = this.units.filter(u => {
      const origin = originalMap[u.uid]
      return origin && JSON.stringify(origin) !== JSON.stringify(u)
    })
    const deleteUids = this.storage_units
      .filter(o => !currentMap[o.uid])
      .map(o => o.uid)

    return { add, update, delete: deleteUids }
  }

  updateUnit(uid, key, value) {
    const unit = this.units.find(u => u.uid === uid)
    if (unit) unit[key] = value
  }

  removeUnits(uids) {
    this.units = this.units.filter(u => !uids.includes(u.uid))
  }

  selectUnit(index) {
    this.selectedUnitIndex = index
  }

  commitChanges() {
    this.storage_units = JSON.parse(JSON.stringify(this.units))
  }
}
