import React, { FC, useState } from 'react'
import { Button, Collapse, Form, Input, Modal, Spin, Table, Tag } from 'antd'
import { IdcardOutlined } from '@ant-design/icons';

import { useAppContext } from './AppContext'

import {
    useSearchAllOrderQuery,
    OrderDetailAttributesFragment,
    useGetCustomerInfoLazyQuery
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

export const AllOrderList: FC = () => {


    const [showForm, setShowForm] = useState<boolean>(false)

    const { data, loading, error } = useSearchAllOrderQuery()
    const orderList = data?.searchOrder.elems

    const [getCustomerInfo, { data: customerData }] = useGetCustomerInfoLazyQuery()



    const orderdetailsTable = (orderdetails: OrderDetailAttributesFragment[], orderId: string) => {
        return (
            orderdetails?.map(elem => {
                return {
                    key: elem.id ?? "",
                    goodType: elem.goodType.entity?.name,
                    descr: elem.goodType.entity?.descr,
                    price: elem.goodType.entity?.price,
                    action: (<>
                        <Button style={{ margin: "2px" }}
                            key={elem.id}
                            onClick={() => { }}
                        >
                            <IdcardOutlined />
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
                                <Item>{"Order number: " + order.id}</Item>
                                <Item>{"Customer: " + order.customer.entityId}</Item>
                                <Item>
                                    <Button style={{ margin: "2px" }}
                                        key={order.id}
                                        onClick={() => { 
                                            getCustomerInfo({variables:{ cond: "it.$id == '" + order.customer.entityId +"'" }})
                                            setShowForm(true)
                                        }}
                                    >
                                        <IdcardOutlined />
                                    </Button>
                                </Item>
                            </Form>
                        )}

                        key={order.id}>
                        <Table
                            columns={columns}
                            dataSource={orderdetailsTable(order?.orderDetailList?.elems, order.id)}
                        />
                    </Panel>
                )
            })

        )
    }

    if (loading) return (<Spin tip="Loading..." />);
    if (error) return <p>`Error! ${error.message}`</p>;

    return (
        <>
            <Collapse>
                {orderPanels(orderList)}
            </Collapse>
            <Modal visible={showForm}
                onCancel={() => setShowForm(false)}
            >
                <Form>
                    <Form.Item>
                        {"First Name: " + customerData?.searchCustomer.elems[0].data.firstName}
                    </Form.Item>
                    <Form.Item>
                        {"Last Name: " + customerData?.searchCustomer.elems[0].data.lastName}
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )




}

