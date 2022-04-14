import React, { FC, useState } from 'react'

import { Button, Form, Input, Modal, Select, Spin, Table } from 'antd'

import { OrderDetailForVendorAttributesFragment, useCreatePckgMutation, useSearchOrderDetailForVendorQuery } from '../__generate/graphql-frontend'

const columns = [
    {
        title: "Name",
        key: 'name',
        dataIndex: 'name',
    },
    {
        title: "Status",
        key: 'status',
        dataIndex: 'status',
    },
    {
        title: "Action",
        key: 'action',
        dataIndex: 'action',
    },
]

enum ShowForm {
    None,
    Update
}


export const OrderDetailForVendorList: FC = () => {

    const [showForm, setShowForm] = useState<ShowForm>(ShowForm.None)

    const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetailForVendorAttributesFragment>()

    const [serialNumber, setSerialNumber] = useState<string>()


    const { data, loading, error } = useSearchOrderDetailForVendorQuery()
    const orderDetailForPackaging = data?.searchOrderDetail.elems


    const [createPckgMutation] = useCreatePckgMutation()


    const mapToView = (list: typeof orderDetailForPackaging) => {
        return (
            list?.map(elem => {
                return {
                    key: elem.id ?? "",
                    name: elem.goodType.entity?.name,
                    action: (<>
                        <Button style={{ margin: "2px" }}
                            key={elem.id}
                            onClick={() => {
                                setSelectedOrderDetail(elem)
                                setShowForm(ShowForm.Update)
                            }}
                        >Package
                        </Button>

                    </> 
                    )
                }
            })
        )
    }

    if (loading) return (<Spin tip="Loading..." />);
    if (error) return <p>`Error! ${error.message}`</p>;

    return (
        <>
            <Modal visible={showForm != ShowForm.None}
                onCancel={() => setShowForm(ShowForm.None)}
                onOk={() => {
                    createPckgMutation({
                        variables: {
                            vendorId: selectedOrderDetail?.goodType.entity?.vendor.entityId!,
                            serialNumber: serialNumber!,
                            deliveryAddress: selectedOrderDetail?.order.deliveryAddress!,
                            orderRef: selectedOrderDetail?.order.id!,
                            orderDetailRef: selectedOrderDetail?.id!,
                            orderDetailId: selectedOrderDetail?.id!
                        },
                        refetchQueries:["searchOrderDetailForVendor"]
                    }).catch(reason => {
                        console.log(reason)
                    })
                    setShowForm(ShowForm.None)
                }}
            >
                <Form>
                    <Form.Item>
                        <Input placeholder="Serial number"
                            value={serialNumber}
                            onChange={e => setSerialNumber(e.target.value)}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Table
                columns={columns}
                dataSource={mapToView(orderDetailForPackaging)}
            />
        </>
    )
}
