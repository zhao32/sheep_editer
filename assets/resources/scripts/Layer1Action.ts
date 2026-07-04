import { _decorator, Component, Node, Prefab, Vec3, UITransform, instantiate, Vec2, SpriteFrame, Input, EventTouch } from 'cc';
import { GameState } from './GameState';
import { PreBlockAction } from './PreBlockAction';
const { ccclass, property } = _decorator;
/**
 * @description layer1脚本
 * @author 毛山
 * @timestamp 2023-4-1
 */
@ccclass('Layer1Action')
export class Layer1Action extends Component {
    //block 预置体
    @property({ type: Prefab })
    pre_block: Prefab = null;


    start() {

    }

    update(deltaTime: number) {

    }

    /**
     * 添加一个block，根据世界坐标
     * @param world 世界坐标
     * @returns 
     */
    add_block_by_world_position(world: Vec3): PreBlockAction {
        //转换世界坐标到本地坐标
        let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(world);
        return this.add_block_by_local_position(local);
    }
    /**
     * 添加一个block，根据layer1本地坐标
     * @param local 本地坐标
     * @returns 
     */
    add_block_by_local_position(local: Vec3): PreBlockAction {
        //实例预置体
        let block = instantiate(this.pre_block);
        block.setPosition(local);
        block.setParent(this.node);
        return block.getComponent(PreBlockAction);
    }

    /**
     * 删除block根据世界坐标
     * @param world 世界坐标
     */
    subtract_block(world: Vec3) {
        //转换世界坐标到本地坐标
        let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(world);
        for (let i = this.node.children.length - 1; i >= 0; i--) {
            //根据包围盒子判断是否包含
            if (this.node.children[i].getComponent(PreBlockAction).get_bounding_box().contains(new Vec2(local.x, local.y))) {
                this.node.children[i].removeFromParent();
                break;
            }
        }
    }

    /**
     * 刷新遮挡关系
     */
    refresh_shadow() {
        for (let i = 0; i < this.node.children.length; i++) {
            let ele_1 = this.node.children[i].getComponent(PreBlockAction);
            //判断node是否激活
            if (!ele_1.node.active) {
                continue;
            }
            ele_1.show();
            for (let j = i + 1; j < this.node.children.length; j++) {
                let ele_2 = this.node.children[j].getComponent(PreBlockAction);
                if (!ele_2.node.active) {
                    continue;
                }
                //根据包围盒子判断是否和另外的盒子有相交关系
                if (ele_1.get_bounding_box().intersects(ele_2.get_bounding_box())) {
                    ele_1.hide();
                    break;
                }
            }
        }
    }

    /**
     * 获取layer1中 block的数量
     * @returns 
     */
    get_children(): Node[] {
        return this.node.children;
    }

    /**
     * 清理所有block
     */
    clear_all() {
        this.node.removeAllChildren();
    }

    /**
     * 根据传入的坐标，获取触控到的block
     * @param pos_world 坐标 vector 2
     * @returns 
     */
    get_touch_block(pos_world: Vec2): PreBlockAction {
        //转换成本地坐标
        let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(pos_world.x, pos_world.y));
        for (let i = this.node.children.length - 1; i >= 0; i--) {
            let ele = this.node.children[i];
            if (!ele.active) {
                continue;
            }
            let block_action = ele.getComponent(PreBlockAction);
            //查看是否可以触控，（如果显示阴影则不可以触控）
            if (!block_action.can_touch()) {
                continue;
            }
            //根据包围盒子和坐标的关系来判断
            if (block_action.get_bounding_box().contains(new Vec2(local.x, local.y))) {
                return block_action;
            }
        }
        return null;
    }

    /**
     * 获取layer1 block数量
     * @returns 
     */
    get_block_size(): number {
        return this.node.children.length;
    }

}

