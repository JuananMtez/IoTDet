import subprocess
import sys
import glob
import os
import requests

SCN = "/sys/class/net"
min_idx = 65535
arphrd_ether = 1
ifdev = None
MAC = None

# find iface with lowest ifindex, skip non ARPHRD_ETHER types (lo, sit ...)
for dev in glob.glob(os.path.join(SCN, "*")):
    type_file = os.path.join(dev, "type")

    if not os.path.isfile(type_file):
        continue

    with open(type_file, 'r') as f:
        iftype = int(f.read().strip())

    if iftype != arphrd_ether:
        continue

    # Skip dummy interfaces
    if "dummy" in dev:
        continue

    with open(os.path.join(dev, "ifindex"), 'r') as f:
        idx = int(f.read().strip())

    if idx < min_idx:
        min_idx = idx
        ifdev = dev

if ifdev is None:
    print("no suitable interfaces found")
    exit(1)
else:
    # grab MAC address
    with open(os.path.join(ifdev, "address"), 'r') as f:
        MAC = f.read().strip()


events = "alarmtimer:alarmtimer_fired,alarmtimer:alarmtimer_start,block:block_bio_backmerge,block:block_bio_remap,block:block_dirty_buffer,block:block_getrq,block:block_touch_buffer,block:block_unplug,cachefiles:cachefiles_create,cachefiles:cachefiles_lookup,cachefiles:cachefiles_mark_active,clk:clk_set_rate,cpu-migrations,cs,dma_fence:dma_fence_init,fib:fib_table_lookup,filemap:mm_filemap_add_to_page_cache,gpio:gpio_value,ipi:ipi_raise,irq:irq_handler_entry,irq:softirq_entry,jbd2:jbd2_handle_start,jbd2:jbd2_start_commit,kmem:kfree,kmem:kmalloc,kmem:kmem_cache_alloc,kmem:kmem_cache_free,kmem:mm_page_alloc,kmem:mm_page_alloc_zone_locked,kmem:mm_page_free,kmem:mm_page_pcpu_drain,mmc:mmc_request_start,net:net_dev_queue,net:net_dev_xmit,net:netif_rx,page-faults,pagemap:mm_lru_insertion,preemptirq:irq_enable,qdisc:qdisc_dequeue,qdisc:qdisc_dequeue,random:get_random_bytes,random:mix_pool_bytes_nolock,random:urandom_read,raw_syscalls:sys_enter,raw_syscalls:sys_exit,rpm:rpm_resume,rpm:rpm_suspend,sched:sched_process_exec,sched:sched_process_free,sched:sched_process_wait,sched:sched_switch,sched:sched_wakeup,signal:signal_deliver,signal:signal_generate,skb:consume_skb,skb:consume_skb,skb:kfree_skb,skb:kfree_skb,skb:skb_copy_datagram_iovec,sock:inet_sock_set_state,task:task_newtask,tcp:tcp_destroy_sock,tcp:tcp_probe,timer:hrtimer_start,timer:timer_start,udp:udp_fail_queue_rcv_skb,workqueue:workqueue_activate_work,writeback:global_dirty_state,writeback:sb_clear_inode_writeback,writeback:wbc_writepage,writeback:writeback_dirty_inode,writeback:writeback_dirty_inode_enqueue,writeback:writeback_dirty_page,writeback:writeback_mark_inode_dirty,writeback:writeback_pages_written,writeback:writeback_single_inode,writeback:writeback_write_inode,writeback:writeback_written"


while True:
    response = requests.get(f"https://iotdet.eu.loclx.io/scenario/recording/device/can_send_data/check?mac_address={MAC}")

    if response.status_code == 200:
        if response.json():
            result = subprocess.run(["perf", "stat", "--log-fd", "1", "-e", events, "-a", "sleep", "5"], capture_output=True, text=True)
            perfResults = result.stdout
            sample_lines = perfResults.splitlines()
            sample_lines = [line[:20].replace(' ', '').replace(',', '.') for line in sample_lines[3:-2]]
            sample = [event for event in sample_lines if event]
            data = {
                "name": 'monitoring',
                "mac_address": MAC,
                'values': sample
            }

            response2 = requests.post("https://iotdet.eu.loclx.io/device/recording/data/store", headers={"Content-Type": "application/json"}, json=data)

        else:
            sys.exit()
    elif response.status_code == 404:
        sys.exit()
