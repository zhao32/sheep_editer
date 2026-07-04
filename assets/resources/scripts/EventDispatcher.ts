import { _decorator, Component, Node } from 'cc';
import { EventTarget } from 'cc';
const { ccclass, property } = _decorator;

const event_target = new EventTarget();
/**
 * @description 自定义事件
 * @author 毛山
 * @timestamp 2023-4-1
 */
export class EventDispatcher {
    private static data: EventDispatcher;

    //更新编辑器block数量
    public static UPDATE_BLOCK_SIZE = "update_block_size";
    //显示tips
    public static TIPS_MSG = "tips_msg";

    static get_target(): EventTarget {
        if (EventDispatcher.data == null) {
            EventDispatcher.data = new EventDispatcher();
        }
        return EventDispatcher.data.get_event_target();
    }

    private get_event_target(): EventTarget {
        return event_target;
    }
}

