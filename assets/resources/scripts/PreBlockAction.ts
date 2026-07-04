import { _decorator, Component, Node, Rect, UITransform, SpriteFrame, Sprite, Vec3, tween, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;
/**
 * @description block预置体脚本
 * @author 毛山
 * @timestamp 2023-4-1
 */
@ccclass('PreBlockAction')
export class PreBlockAction extends Component {

    //该block原始的block
    original: PreBlockAction = null;

    start() {

    }

    update(deltaTime: number) {

    }
    /**
     * 获取block 默认的包围盒子
     * @returns 
     */
    get_bounding_box(): Rect {
        return this.node.getComponent(UITransform).getBoundingBox();
    }
    /**
     * 用户自定义的包围盒子
     * @returns 
     */
    get_custom_bounding_box(): Rect {
        let rec_1 = this.get_bounding_box();
        let num = 15;
        let rect_1 = this.get_bounding_box();
        let rect_2 = new Rect(rec_1.x + num, rec_1.y + num,
            rec_1.width - num * 2, rec_1.height - num * 2);
        return rect_2;
    }

    /**
     * 隐藏block(block加入阴影)
     */
    hide() {
        this.node.getChildByName("y_shadow").active = true;
    }
    /**
     * 显示 block(block去除阴影)
     */
    show() {
        this.node.getChildByName("y_shadow").active = false;
    }

    /**
     * 能否点击,根据是否显示阴影来判断的
     * @returns 
     */
    can_touch(): boolean {
        return !this.node.getChildByName("y_shadow").active;
    }


}

