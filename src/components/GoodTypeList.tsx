import React, { FC } from 'react'
import { Button, Select, Spin, Table } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons';


import { useAppContext } from './AppContext'

import {
    useSearchGoodTypeQuery,
    useAddOrderDetailMutation,
    SearchOrderDocument,
    useSearchOrderQuery,
    AddOrderDetailMutation,
    _DeliveryAddressInput
} from '../__generate/graphql-frontend'

const { Option } = Select

const columns = [
    {
        title: "Name",
        key: 'name',
        dataIndex: 'name',
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
        title: "Vendor",
        key: 'vendor',
        dataIndex: 'vendor',
    },
    {
        title: "Action",
        key: 'action',
        dataIndex: 'action',
    },
]

interface GoodTypeListProps {
    deliveryAddress: _DeliveryAddressInput
}

export const GoodTypeList: FC<GoodTypeListProps> = ({ deliveryAddress }) => {

    const appContext = useAppContext()

    const { data, loading, error } = useSearchGoodTypeQuery()
    const goodtypeList = data?.searchGoodType.elems

    const { data: dataO, loading: loadingO, error: errorO } = useSearchOrderQuery()
    const orderList = dataO?.searchOrder.elems

    const [addOrderDetailMutation] = useAddOrderDetailMutation()


    const concatResult = (listBeforeAdd: typeof orderList, addResult: AddOrderDetailMutation) => {
        const result = { ...addResult.packet?.updateOrCreateOrder?.returning }
        result.orderDetailList?.elems.push({ ...addResult.packet?.createOrderDetail! })

        if (listBeforeAdd?.length! > 0) {
            return [result, ...listBeforeAdd!.filter(x => x.id != result.id)]
        } else {
            return [result]
        }

    }


    const mapToView = (list: typeof goodtypeList) => {
        return (
            list?.map(elem => {
                return {
                    key: elem.id ?? "",
                    name: elem.name,
                    descr: elem.descr,
                    price: elem.price,
                    vendor: elem.vendor?.entity?.name,
                    action: (<>
                        <Button style={{ margin: "2px" }}
                            key={elem.id}
                            onClick={() => {
                                addOrderDetailMutation({
                                    variables: {
                                        customerId: appContext.userInfo!.email!,
                                        goodTypeId: elem.id,
                                        deliveryAddress: deliveryAddress
                                    },
                                    update: (store, result) => {
                                        store.writeQuery({
                                            query: SearchOrderDocument,
                                            data: {
                                                searchOrder: {
                                                    elems: concatResult(orderList!, result!.data!)
                                                }
                                            }
                                        })
                                    }
                                })

                            }}
                        >
                            <ShoppingCartOutlined />
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
            <Table
                columns={columns}
                dataSource={mapToView(goodtypeList)}
            />
            {/* {drawGoodTypeList()} */}
        </>
    )
}

