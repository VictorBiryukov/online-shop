import React, { FC, useState, useEffect } from 'react'
import { Alert, Button, Form, Input, Layout, Modal, Spin, Tabs } from 'antd';

import { useAppContext } from './AppContext'

import { _CreateCustomerInput, CustomerAttributesFragment, useAddCustomerInfoMutation } from '../__generate/graphql-frontend'

import { GoodTypeList } from './GoodTypeList'
import { OrderList } from './OrderList'
import { AllOrderList } from './AllOrderList'

import {OrderDetailForVendorList} from './OrderDetailForVendorList'


const { TabPane } = Tabs
const { Header, Content } = Layout


type InputParameters = Partial<_CreateCustomerInput>

enum ShowForm {
    None,
    Update
}

function mapToInput(data: CustomerAttributesFragment | undefined): InputParameters {
    const result = { ...data }
    delete result.__typename
    delete result.data?.__typename
    delete result.defaultDeliveryAddress?.__typename
    return result
}

export const AppTabs: FC = () => {

    useEffect(() => {
        addCustomerInfoMutation({ variables: { customerInput: { id: appContext.userInfo!.email } } })
        .then(
            result => setInputParameters(mapToInput(result.data!.packet!.updateOrCreateCustomer!.returning!))
        )
      }, [])


    const appContext = useAppContext()

    const [showForm, setShowForm] = useState<ShowForm>(ShowForm.None)
    const [inputParameters, setInputParameters] = useState<InputParameters>({})

    const [addCustomerInfoMutation, { data, loading, error }] = useAddCustomerInfoMutation()

    if (loading) return (<Spin tip="Loading..." />);
    if (error) return <p>`Error! ${error.message}`</p>;

    return (
        <Layout>
            <Header>
                <Button onClick={() => setShowForm(ShowForm.Update)}>
                    {appContext.userInfo?.preferred_username + " personal data"}
                </Button>
                <Button onClick={() => appContext.keycloak?.logout()} style={{ left: "85%" }}>
                    {"Logout"}
                </Button>
                <Modal visible={showForm != ShowForm.None}
                    onCancel={() => setShowForm(ShowForm.None)}
                    onOk={() => {
                            addCustomerInfoMutation({ variables: { customerInput: inputParameters as _CreateCustomerInput} })
                        setShowForm(ShowForm.None)
                    }}
                >
                    <Form title='Personal Data'>
                        <Form.Item>
                            <Input placeholder="First Name"
                                value={inputParameters?.data?.firstName!}
                                onChange={e => {
                                    const input = { ...inputParameters }
                                    input.data = Object.assign(input.data, {firstName: e.target.value})
                                    setInputParameters(input)
                                }}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Input placeholder="Last Name"
                                value={inputParameters?.data?.lastName!}
                                onChange={e => {
                                    const input = { ...inputParameters }
                                    input.data = Object.assign(input.data, {lastName: e.target.value})
                                    setInputParameters(input)
                                }}
                            />
                        </Form.Item>
                    </Form>

                    <Form title='Delivery Address'>
                        <Form.Item>
                            <Input placeholder="Country"
                                value={inputParameters?.defaultDeliveryAddress?.countryIso!}
                                onChange={e => {
                                    const input = { ...inputParameters }
                                    input.defaultDeliveryAddress = Object.assign(input.defaultDeliveryAddress, {countryIso: e.target.value})
                                    setInputParameters(input)
                                }}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Input placeholder="Region"
                                value={inputParameters?.defaultDeliveryAddress?.regionIso!}
                                onChange={e => {
                                    const input = { ...inputParameters }
                                    input.defaultDeliveryAddress = Object.assign(input.defaultDeliveryAddress, {regionIso: e.target.value})
                                    setInputParameters(input)
                                }}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Input placeholder="City"
                                value={inputParameters?.defaultDeliveryAddress?.city!}
                                onChange={e => {
                                    const input = { ...inputParameters }
                                    input.defaultDeliveryAddress = Object.assign(input.defaultDeliveryAddress, {city: e.target.value})
                                    setInputParameters(input)
                                }}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Input placeholder="Street"
                                value={inputParameters?.defaultDeliveryAddress?.street!}
                                onChange={e => {
                                    const input = { ...inputParameters }
                                    input.defaultDeliveryAddress = Object.assign(input.defaultDeliveryAddress, {street: e.target.value})
                                    setInputParameters(input)
                                }}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Input placeholder="Flat"
                                value={inputParameters?.defaultDeliveryAddress?.flatNumber!}
                                onChange={e => {
                                    const input = { ...inputParameters }
                                    input.defaultDeliveryAddress = Object.assign(input.defaultDeliveryAddress, {flatNumber: e.target.value})
                                    setInputParameters(input)
                                }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </Header>
            <Content>
                <Tabs style={{ margin: "5px" }}>
                    <TabPane key="goods" tab="Goods">
                        <GoodTypeList deliveryAddress={inputParameters.defaultDeliveryAddress!}></GoodTypeList>
                    </TabPane>
                    <TabPane key="orders" tab="My orders">
                        <OrderList></OrderList>
                    </TabPane>
                    <TabPane key="all_orders" tab="All orders">
                        <AllOrderList></AllOrderList>
                    </TabPane>
                    <TabPane key="orders_detail_for_vendor" tab="Orders details for vendor">
                        <OrderDetailForVendorList></OrderDetailForVendorList>
                    </TabPane>
                </Tabs>
            </Content>
        </Layout>
    )
}


