package libp2p

import (
	"context"
	"fmt"
	"log"
	"sync"

	"github.com/keep-network/keep-core/pkg/net"
	floodsub "github.com/libp2p/go-floodsub"
)

type channel struct {
	name string
	sub  *floodsub.Subscription

	unmarshalersMutex  sync.Mutex
	unmarshalersByType map[string]func() net.TaggedUnmarshaler

	identifiersMutex            sync.Mutex
	transportToProtoIdentifiers map[net.TransportIdentifier]net.ProtocolIdentifier
	protoToTransportIdentifiers map[net.ProtocolIdentifier]net.TransportIdentifier
}

func (c *channel) Name() string {
	return c.name
}

func (c *channel) Send(message net.TaggedMarshaler) error {
	return nil
}

func (c *channel) SendTo(
	recipientIdentifier interface{},
	message net.TaggedMarshaler,
) error {
	return nil
}

func (c *channel) Recv(h net.HandleMessageFunc) error {
	return nil
}

func (ch *channel) handleSubscription(ctx context.Context, cancel func()) {
	defer ch.sub.Cancel()
	defer cancel()

	for {
		_, err := ch.sub.Next(ctx)
		if err != nil {
			log.Println(err)
			return
		}
		// handle message
	}
}

func (c *channel) RegisterIdentifier(
	transportIdentifier net.TransportIdentifier,
	protocolIdentifier net.ProtocolIdentifier,
) error {
	c.identifiersMutex.Lock()
	defer c.identifiersMutex.Unlock()

	if _, ok := transportIdentifier.(*identity); !ok {
		return fmt.Errorf(
			"incorrect type for transportIdentifier: [%v] in channel [%s]",
			transportIdentifier, c.name,
		)
	}

	if _, exists := c.transportToProtoIdentifiers[transportIdentifier]; exists {
		return fmt.Errorf(
			"protocol identifier in channel [%s] already associated with [%v]",
			c.name, transportIdentifier,
		)
	}
	if _, exists := c.protoToTransportIdentifiers[protocolIdentifier]; exists {
		return fmt.Errorf(
			"transport identifier in channel [%s] already associated with [%v]",
			c.name, protocolIdentifier,
		)
	}

	c.transportToProtoIdentifiers[transportIdentifier] = protocolIdentifier
	c.protoToTransportIdentifiers[protocolIdentifier] = transportIdentifier

	return nil
}

func (c *channel) RegisterUnmarshaler(unmarshaler func() net.TaggedUnmarshaler) error {
	tpe := unmarshaler().Type()

	c.unmarshalersMutex.Lock()
	defer c.unmarshalersMutex.Unlock()

	if _, exists := c.unmarshalersByType[tpe]; exists {
		return fmt.Errorf("type %s already has an associated unmarshaler", tpe)
	}

	c.unmarshalersByType[tpe] = unmarshaler
	return nil
}
