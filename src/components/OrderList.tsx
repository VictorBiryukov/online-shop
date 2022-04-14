import React, { FC } from 'react'
import { Button, Collapse, Form, Spin, Table, Tag } from 'antd'
import { DeleteOutlined } from '@ant-design/icons';

import { useAppContext } from './AppContext'

import {
    useSearchOrderQuery,
    SearchOrderDocument,
    OrderDetailAttributesFragment,
    useFixOrderMutation,
    useDeleteOrderDetailMutation
} from '../__generate/graphql-frontend'

const { Panel } = Collapse;
const { Item } = Form

const columns = [
    {
        title: "Good Type",
        key: 'goodType',
        dataIndex: 'goodType',
    },
    {
        title: "Description",
        key: 'descr',
        dataIndex: 'descr',
    },
    {
        title: "Price",
        key: 'price',
        dataIndex: 'price',
    },
    {
        title: "Action",
        key: 'action',
        dataIndex: 'action',
    }
]

export const OrderList: FC = () => {

    const appContext = useAppContext()

    const { data, loading, error } = useSearchOrderQuery()
    const orderList = data?.searchOrder.elems

    const [fixOrderMutation] = useFixOrderMutation()
    const [deleteDetailMutation] = useDeleteOrderDetailMutation()

    const excludeDeletedDetail = (listBeforeDelete: typeof orderList, detailId: string, orderId: string) => {

        return listBeforeDelete!.map(x => {
            if (x.id != orderId) { return x }
            else {
                const y = { ...x }
                y.orderDetailList = { elems: y.orderDetailList.elems.filter(z => z.id != detailId)}
                return y
            }
        })

    }

    const detailsTable = (details: OrderDetailAttributesFragment[], orderId: string) => {
        return (
            details?.map(elem => {
                return {
                    key: elem.id ?? "",
                    goodType: elem.goodType.entity?.name,
                    descr: elem.goodType.entity?.descr,
                    price: elem.goodType.entity?.price,
                    action: (<>
                        <Button style={{ margin: "2px" }}
                            key={elem.id}
                            onClick={() => {
                                deleteDetailMutation({
                                    variables: {
                                        orderDetailId: elem.id
                                    },
                                    update: (store) => {
                                        store.writeQuery({
                                            query: SearchOrderDocument,
                                            variables: {/*  cond: "it.customer.entityId == '" + appContext.userInfo?.email + "'"  */},
                                            data: {
                                                searchOrder: {
                                                    elems: excludeDeletedDetail(orderList, elem.id, orderId)
                                                }
                                            }
                                        })
                                    }
                                })
                            }}
                        >
                            <DeleteOutlined />
                        </Button>
                    </>
                    )
                }
            })
        )
    }

    const orderPanels = (list: typeof orderList) => {
        return (
            list?.map(order => {
                return (
                    <Panel
                        header={(
                            <Form layout="inline">
                                <Item><Tag color="blue">{order.statusForVendor?.code}</Tag></Item>
                                <Item>{"Order create date: " + (order.orderDate as string).substring(0, 10)}</Item>
                                {/* <Item>{"Order create date: " + order.orderDate}</Item> */}
                                <Item>{"Order number: " + order.id}</Item>
                            </Form>
                        )}
                        extra={order.statusForVendor?.code == "DRAFT" && (
                            <Button type="primary"
                                onClick={() => { fixOrderMutation({ variables: { orderId: order.id } }) }}
                            >Approve order</Button>
                        )}
                        key={order.statusForVendor?.code == "DRAFT" ? "DRAFT" : order.id}>
                        <Table
                            columns={columns}
                            dataSource={detailsTable(order?.orderDetailList?.elems, order.id)}
                        />
                    </Panel>
                )
            })

        )
    }

    if (loading) return (<Spin tip="Loading..." />);
    if (error) return <p>`Error! ${error.message}`</p>;

    return (

        <Collapse defaultActiveKey={['DRAFT']} >
            {orderPanels(orderList)}
        </Collapse>
    )

}

